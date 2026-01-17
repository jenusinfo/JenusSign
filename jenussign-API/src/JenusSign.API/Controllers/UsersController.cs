using AutoMapper;
using JenusSign.Application.DTOs;
using JenusSign.Core.Entities;
using JenusSign.Core.Enums;
using JenusSign.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Linq.Expressions;

namespace JenusSign.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<UsersController> _logger;
    private readonly UserManager<User> _userManager;

    public UsersController(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<UsersController> logger,
        UserManager<User> userManager)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
        _userManager = userManager;
    }

    /// <summary>
    /// Get all users (Admin only)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserListResponse>> GetUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] UserRole? role = null,
        [FromQuery] string? search = null)
    {
        var searchLower = (search ?? string.Empty).ToLowerInvariant();

        var predicate = (Expression<Func<User, bool>>)(u =>
            (!role.HasValue || u.Role == role.Value) &&
            (string.IsNullOrWhiteSpace(searchLower) ||
                (u.Email ?? string.Empty).ToLower().Contains(searchLower) ||
                (u.FirstName ?? string.Empty).ToLower().Contains(searchLower) ||
                (u.LastName ?? string.Empty).ToLower().Contains(searchLower) ||
                (u.BusinessKey ?? string.Empty).ToLower().Contains(searchLower)));

        var totalCount = await _unitOfWork.Users.CountAsync(predicate);

        var users = await _unitOfWork.Users.GetAllAsync(
            predicate: predicate,
            orderBy: q => q.OrderBy(u => u.Role).ThenBy(u => u.LastName),
            page: page,
            pageSize: pageSize);

        return Ok(new UserListResponse(
            Users: _mapper.Map<IEnumerable<UserDto>>(users),
            TotalCount: totalCount,
            Page: page,
            PageSize: pageSize
        ));
    }

    /// <summary>
    /// Get user by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserDto>> GetUser(Guid id)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null)
            return NotFound();

        return Ok(_mapper.Map<UserDto>(user));
    }

    /// <summary>
    /// Get user by business key
    /// </summary>
    [HttpGet("by-key/{businessKey}")]
    public async Task<ActionResult<UserDto>> GetUserByBusinessKey(string businessKey)
    {
        var user = await _unitOfWork.Users.GetByBusinessKeyAsync(businessKey);
        if (user == null)
            return NotFound();

        return Ok(_mapper.Map<UserDto>(user));
    }

    /// <summary>
    /// Create new user (Admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserRequest request)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
            return BadRequest(new { message = "Email already exists" });

        var user = _mapper.Map<User>(request);
        user.UserName = request.Email;
        user.Role = request.Role;

        var createResult = await _userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            return BadRequest(new { message = string.Join("; ", createResult.Errors.Select(e => e.Description)) });
        }

        await _userManager.AddToRoleAsync(user, user.Role.ToString());

        _logger.LogInformation("User {BusinessKey} created by admin", user.BusinessKey);

        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, _mapper.Map<UserDto>(user));
    }

    /// <summary>
    /// Update user
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserDto>> UpdateUser(Guid id, [FromBody] UpdateUserRequest request)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null)
            return NotFound();

        if (request.FirstName != null) user.FirstName = request.FirstName;
        if (request.LastName != null) user.LastName = request.LastName;
        if (request.Phone != null) user.Phone = request.Phone;
        if (request.IsActive.HasValue) user.IsActive = request.IsActive.Value;
        if (request.BrokerId.HasValue) user.BrokerId = request.BrokerId;

        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            return BadRequest(new { message = string.Join("; ", updateResult.Errors.Select(e => e.Description)) });
        }

        return Ok(_mapper.Map<UserDto>(user));
    }

    /// <summary>
    /// Get agents under a broker
    /// </summary>
    [HttpGet("brokers/{brokerId:guid}/agents")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAgentsByBroker(Guid brokerId)
    {
        var agents = await _unitOfWork.Users.GetAgentsByBrokerIdAsync(brokerId);
        return Ok(_mapper.Map<IEnumerable<UserDto>>(agents));
    }

    /// <summary>
    /// Get all brokers
    /// </summary>
    [HttpGet("brokers")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetBrokers()
    {
        var brokers = await _unitOfWork.Users.FindAsync(u => u.Role == UserRole.Broker);
        return Ok(_mapper.Map<IEnumerable<UserDto>>(brokers));
    }
}
