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
public class ProposalsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IEmailService _emailService;
    private readonly ILogger<ProposalsController> _logger;
    private readonly string _baseUrl;

    public ProposalsController(
        IUnitOfWork unitOfWork, 
        IMapper mapper,
        IEmailService emailService,
        IConfiguration configuration,
        ILogger<ProposalsController> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _emailService = emailService;
        _logger = logger;
        _baseUrl = configuration["App:BaseUrl"] ?? "https://jenussign.jenusplanet.com";
    }

    /// <summary>
    /// Get proposals based on user role
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ProposalListResponse>> GetProposals(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] ProposalStatus? status = null,
        [FromQuery] ProposalType? type = null,
        [FromQuery] string? search = null)
    {
        var (userId, role, _) = GetCurrentUserContext();

        IEnumerable<Proposal> proposals;

        if (role == UserRole.Agent)
        {
            proposals = await _unitOfWork.Proposals.GetByAgentIdAsync(userId);
        }
        else if (role == UserRole.Broker)
        {
            proposals = await _unitOfWork.Proposals.GetByBrokerIdAsync(userId);
        }
        else
        {
            proposals = await _unitOfWork.Proposals.GetAllAsync();
        }

        var query = proposals.AsQueryable();

        if (status.HasValue)
            query = query.Where(p => p.Status == status.Value);

        if (type.HasValue)
            query = query.Where(p => p.ProposalType == type.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(p =>
                p.ReferenceNumber.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                p.BusinessKey.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                p.Title.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                p.Customer.DisplayName.Contains(search, StringComparison.OrdinalIgnoreCase));
        }

        var totalCount = query.Count();
        var pagedProposals = query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return Ok(new ProposalListResponse(
            Proposals: _mapper.Map<IEnumerable<ProposalDto>>(pagedProposals),
            TotalCount: totalCount,
            Page: page,
            PageSize: pageSize
        ));
    }

    /// <summary>
    /// Get proposal by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ProposalDto>> GetProposal(Guid id)
    {
        var proposal = await _unitOfWork.Proposals.GetByIdAsync(id);
        if (proposal == null)
            return NotFound();

        if (!CanAccessProposal(proposal))
            return Forbid();

        return Ok(_mapper.Map<ProposalDto>(proposal));
    }

    /// <summary>
    /// Get proposal by reference number
    /// </summary>
    [HttpGet("by-reference/{referenceNumber}")]
    public async Task<ActionResult<ProposalDto>> GetProposalByReference(string referenceNumber)
    {
        var proposal = await _unitOfWork.Proposals.GetByReferenceNumberAsync(referenceNumber);
        if (proposal == null)
            return NotFound();

        if (!CanAccessProposal(proposal))
            return Forbid();

        return Ok(_mapper.Map<ProposalDto>(proposal));
    }

    /// <summary>
    /// Create new proposal
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ProposalDto>> CreateProposal([FromBody] CreateProposalRequest request)
    {
        var (userId, _, _) = GetCurrentUserContext();

        // Verify customer exists and user has access
        var customer = await _unitOfWork.Customers.GetByIdAsync(request.CustomerId);
        if (customer == null)
            return BadRequest(new { message = "Customer not found" });

        var proposal = _mapper.Map<Proposal>(request);
        proposal.BusinessKey = await _unitOfWork.Proposals.GenerateBusinessKeyAsync();
        proposal.ReferenceNumber = await _unitOfWork.Proposals.GenerateReferenceNumberAsync();
        proposal.AgentId = userId;
        proposal.Currency = request.Currency ?? "EUR";

        await _unitOfWork.Proposals.AddAsync(proposal);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Proposal {Reference} created for customer {Customer}", 
            proposal.ReferenceNumber, customer.BusinessKey);

        proposal = await _unitOfWork.Proposals.GetByIdAsync(proposal.Id);
        return CreatedAtAction(nameof(GetProposal), new { id = proposal!.Id }, _mapper.Map<ProposalDto>(proposal));
    }

    /// <summary>
    /// Update proposal
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ProposalDto>> UpdateProposal(Guid id, [FromBody] UpdateProposalRequest request)
    {
        var proposal = await _unitOfWork.Proposals.GetByIdAsync(id);
        if (proposal == null)
            return NotFound();

        if (!CanAccessProposal(proposal))
            return Forbid();

        if (request.Title != null) proposal.Title = request.Title;
        if (request.Description != null) proposal.Description = request.Description;
        if (request.Status.HasValue) proposal.Status = request.Status.Value;
        if (request.Premium.HasValue) proposal.Premium = request.Premium.Value;
        if (request.SumInsured.HasValue) proposal.SumInsured = request.SumInsured.Value;
        if (request.ValidUntil.HasValue) proposal.ValidUntil = request.ValidUntil.Value;

        await _unitOfWork.Proposals.UpdateAsync(proposal);
        await _unitOfWork.SaveChangesAsync();

        return Ok(_mapper.Map<ProposalDto>(proposal));
    }

    /// <summary>
    /// Send proposal for signing
    /// </summary>
    [HttpPost("{id:guid}/send")]
    public async Task<ActionResult<SigningSessionAccessResponse>> SendForSigning(
        Guid id, 
        [FromBody] CreateSigningSessionRequest request)
    {
        var proposal = await _unitOfWork.Proposals.GetByIdAsync(id);
        if (proposal == null)
            return NotFound();

        if (!CanAccessProposal(proposal))
            return Forbid();

        // Create signing session
        var session = new SigningSession
        {
            BusinessKey = $"SES-{Guid.NewGuid().ToString("N")[..8].ToUpper()}",
            ProposalId = proposal.Id,
            CustomerId = proposal.CustomerId,
            ShortCode = SigningSession.GenerateShortCode(),
            ExpiresAt = request.ExpiresAt ?? DateTime.UtcNow.AddDays(7),
            Status = ProposalStatus.PendingReview
        };

        await _unitOfWork.SigningSessions.AddAsync(session);

        // Update proposal status
        proposal.Status = ProposalStatus.PendingReview;
        await _unitOfWork.Proposals.UpdateAsync(proposal);

        await _unitOfWork.SaveChangesAsync();

        var accessUrl = $"{_baseUrl}/sign/{session.AccessToken}";

        // Send email notification
        if (request.SendEmail)
        {
            await _emailService.SendSigningRequestAsync(
                proposal.Customer,
                accessUrl,
                request.CustomerMessage);
        }

        _logger.LogInformation("Signing session {SessionId} created for proposal {Reference}",
            session.Id, proposal.ReferenceNumber);

        return Ok(new SigningSessionAccessResponse(
            SessionId: session.Id,
            AccessUrl: accessUrl,
            ShortCode: session.ShortCode,
            ExpiresAt: session.ExpiresAt ?? DateTime.UtcNow.AddDays(7)
        ));
    }

    /// <summary>
    /// Get proposals by customer ID
    /// </summary>
    [HttpGet("customer/{customerId:guid}")]
    public async Task<ActionResult<IEnumerable<ProposalDto>>> GetProposalsByCustomer(Guid customerId)
    {
        var proposals = await _unitOfWork.Proposals.GetByCustomerIdAsync(customerId);
        return Ok(_mapper.Map<IEnumerable<ProposalDto>>(proposals));
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

    private bool CanAccessProposal(Proposal proposal)
    {
        var (userId, role, _) = GetCurrentUserContext();

        return role switch
        {
            UserRole.Admin or UserRole.Employee => true,
            UserRole.Agent => proposal.AgentId == userId,
            UserRole.Broker => proposal.Agent?.BrokerId == userId,
            _ => false
        };
    }
}
