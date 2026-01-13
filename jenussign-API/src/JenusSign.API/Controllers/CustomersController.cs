using System.Security.Claims;
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
public class CustomersController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<CustomersController> _logger;

    public CustomersController(IUnitOfWork unitOfWork, IMapper mapper, ILogger<CustomersController> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    /// <summary>
    /// Get customers based on user role
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<CustomerListResponse>> GetCustomers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null)
    {
        var (userId, role, brokerId) = GetCurrentUserContext();
        
        IEnumerable<Customer> customers;
        
        // Role-based filtering
        if (role == UserRole.Agent)
        {
            customers = await _unitOfWork.Customers.GetByAgentIdAsync(userId);
        }
        else if (role == UserRole.Broker)
        {
            customers = await _unitOfWork.Customers.GetByBrokerIdAsync(userId);
        }
        else // Admin or Employee see all
        {
            customers = await _unitOfWork.Customers.GetAllAsync();
        }

        var query = customers.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(c =>
                c.FirstName.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                c.LastName.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                c.Email.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                c.BusinessKey.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                (!string.IsNullOrEmpty(c.CompanyName) && c.CompanyName.Contains(search, StringComparison.OrdinalIgnoreCase)));
        }

        var totalCount = query.Count();
        var pagedCustomers = query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return Ok(new CustomerListResponse(
            Customers: _mapper.Map<IEnumerable<CustomerDto>>(pagedCustomers),
            TotalCount: totalCount,
            Page: page,
            PageSize: pageSize
        ));
    }

    /// <summary>
    /// Get customer by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CustomerDto>> GetCustomer(Guid id)
    {
        var customer = await _unitOfWork.Customers.GetByIdAsync(id);
        if (customer == null)
            return NotFound();

        // Check authorization
        if (!CanAccessCustomer(customer))
            return Forbid();

        return Ok(_mapper.Map<CustomerDto>(customer));
    }

    /// <summary>
    /// Get customer by business key
    /// </summary>
    [HttpGet("by-key/{businessKey}")]
    public async Task<ActionResult<CustomerDto>> GetCustomerByBusinessKey(string businessKey)
    {
        var customer = await _unitOfWork.Customers.GetByBusinessKeyAsync(businessKey);
        if (customer == null)
            return NotFound();

        if (!CanAccessCustomer(customer))
            return Forbid();

        return Ok(_mapper.Map<CustomerDto>(customer));
    }

    /// <summary>
    /// Create new customer
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<CustomerDto>> CreateCustomer([FromBody] CreateCustomerRequest request)
    {
        var (userId, role, _) = GetCurrentUserContext();

        // Check if email already exists
        var existingCustomer = await _unitOfWork.Customers.GetByEmailAsync(request.Email);
        if (existingCustomer != null)
            return BadRequest(new { message = "Customer with this email already exists" });

        var customer = _mapper.Map<Customer>(request);
        customer.BusinessKey = await _unitOfWork.Customers.GenerateBusinessKeyAsync();
        customer.AgentId = userId; // Assign to current user if agent

        // If not an agent, require explicit agent assignment
        if (role != UserRole.Agent)
        {
            return BadRequest(new { message = "AgentId must be specified for non-agent users" });
        }

        await _unitOfWork.Customers.AddAsync(customer);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Customer {BusinessKey} created", customer.BusinessKey);

        // Reload with relationships
        customer = await _unitOfWork.Customers.GetByIdAsync(customer.Id);
        return CreatedAtAction(nameof(GetCustomer), new { id = customer!.Id }, _mapper.Map<CustomerDto>(customer));
    }

    /// <summary>
    /// Update customer
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CustomerDto>> UpdateCustomer(Guid id, [FromBody] UpdateCustomerRequest request)
    {
        var customer = await _unitOfWork.Customers.GetByIdAsync(id);
        if (customer == null)
            return NotFound();

        if (!CanAccessCustomer(customer))
            return Forbid();

        if (request.FirstName != null) customer.FirstName = request.FirstName;
        if (request.LastName != null) customer.LastName = request.LastName;
        if (request.CompanyName != null) customer.CompanyName = request.CompanyName;
        if (request.Email != null) customer.Email = request.Email;
        if (request.Phone != null) customer.Phone = request.Phone;
        if (request.Address != null) customer.Address = request.Address;
        if (request.City != null) customer.City = request.City;
        if (request.PostalCode != null) customer.PostalCode = request.PostalCode;
        if (request.IdNumber != null) customer.IdNumber = request.IdNumber;

        await _unitOfWork.Customers.UpdateAsync(customer);
        await _unitOfWork.SaveChangesAsync();

        return Ok(_mapper.Map<CustomerDto>(customer));
    }

    /// <summary>
    /// Delete customer (soft delete)
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteCustomer(Guid id)
    {
        var customer = await _unitOfWork.Customers.GetByIdAsync(id);
        if (customer == null)
            return NotFound();

        await _unitOfWork.Customers.DeleteAsync(customer);
        await _unitOfWork.SaveChangesAsync();

        return NoContent();
    }

    private (Guid userId, UserRole role, Guid? brokerId) GetCurrentUserContext()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
        var brokerIdClaim = User.FindFirst("BrokerId")?.Value;

        var userId = Guid.Parse(userIdClaim!);
        var role = Enum.Parse<UserRole>(roleClaim!);
        var brokerId = string.IsNullOrEmpty(brokerIdClaim) ? null : (Guid?)Guid.Parse(brokerIdClaim);

        return (userId, role, brokerId);
    }

    private bool CanAccessCustomer(Customer customer)
    {
        var (userId, role, brokerId) = GetCurrentUserContext();

        return role switch
        {
            UserRole.Admin or UserRole.Employee => true,
            UserRole.Agent => customer.AgentId == userId,
            UserRole.Broker => customer.Agent?.BrokerId == userId,
            _ => false
        };
    }
}
