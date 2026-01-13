using AutoMapper;
using JenusSign.Application.DTOs;
using JenusSign.Core.Entities;
using JenusSign.Core.Enums;
using JenusSign.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JenusSign.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IUnitOfWork unitOfWork, IMapper mapper, ILogger<UsersController> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
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
        var users = await _unitOfWork.Users.GetAllAsync();
        var query = users.AsQueryable();

        if (role.HasValue)
            query = query.Where(u => u.Role == role.Value);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(u => 
                u.Email.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                u.FirstName.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                u.LastName.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                u.BusinessKey.Contains(search, StringComparison.OrdinalIgnoreCase));

        var totalCount = query.Count();
        var pagedUsers = query
            .OrderBy(u => u.Role)
            .ThenBy(u => u.LastName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return Ok(new UserListResponse(
            Users: _mapper.Map<IEnumerable<UserDto>>(pagedUsers),
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
        var user = await _unitOfWork.Users.GetByIdAsync(id);
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
        // Check if email already exists
        var existingUser = await _unitOfWork.Users.GetByEmailAsync(request.Email);
        if (existingUser != null)
            return BadRequest(new { message = "Email already exists" });

        var user = _mapper.Map<User>(request);
        user.BusinessKey = await _unitOfWork.Users.GenerateBusinessKeyAsync(request.Role);
        user.PasswordHash = AuthController.HashPassword(request.Password);

        await _unitOfWork.Users.AddAsync(user);
        await _unitOfWork.SaveChangesAsync();

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
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        if (user == null)
            return NotFound();

        if (request.FirstName != null) user.FirstName = request.FirstName;
        if (request.LastName != null) user.LastName = request.LastName;
        if (request.Phone != null) user.Phone = request.Phone;
        if (request.IsActive.HasValue) user.IsActive = request.IsActive.Value;
        if (request.BrokerId.HasValue) user.BrokerId = request.BrokerId;

        await _unitOfWork.Users.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();

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
