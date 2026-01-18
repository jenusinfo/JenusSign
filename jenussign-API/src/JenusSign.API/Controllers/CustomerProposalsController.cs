using System.Linq.Expressions;
using AutoMapper;
using JenusSign.Application.DTOs;
using JenusSign.Core.Entities;
using JenusSign.Core.Enums;
using JenusSign.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JenusSign.API.Controllers;

/// <summary>
/// Customer proposals - for logged-in customers to view their proposals
/// Uses CustomerPolicy authorization (customer JWT token)
/// </summary>
[ApiController]
[Route("api/v1/customer-proposals")]
[Authorize(Policy = "CustomerPolicy")]
public class CustomerProposalsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<CustomerProposalsController> _logger;

    public CustomerProposalsController(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<CustomerProposalsController> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    /// <summary>
    /// Get all proposals for the logged-in customer
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<CustomerProposalListResponse>> GetMyProposals(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] ProposalStatus? status = null,
        [FromQuery] ProposalType? type = null)
    {
        var customerId = GetCurrentCustomerId();
        if (customerId == null)
            return Unauthorized();

        Expression<Func<Proposal, bool>> predicate = p =>
            p.CustomerId == customerId.Value &&
            (!status.HasValue || p.Status == status.Value) &&
            (!type.HasValue || p.ProposalType == type.Value);

        var totalCount = await _unitOfWork.Proposals.CountAsync(predicate);

        var includes = new Expression<Func<Proposal, object>>[]
        {
            p => p.Customer,
            p => p.Agent
        };

        var proposals = await _unitOfWork.Proposals.GetAllAsync(
            predicate: predicate,
            orderBy: q => q.OrderByDescending(p => p.CreatedAt),
            page: page,
            pageSize: pageSize,
            includes: includes);

        return Ok(new CustomerProposalListResponse(
            Proposals: _mapper.Map<IEnumerable<CustomerProposalDto>>(proposals),
            TotalCount: totalCount,
            Page: page,
            PageSize: pageSize
        ));
    }

    /// <summary>
    /// Get proposal by ID for the logged-in customer
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CustomerProposalDto>> GetProposal(Guid id)
    {
        var customerId = GetCurrentCustomerId();
        if (customerId == null)
            return Unauthorized();

        var proposal = await _unitOfWork.Proposals.GetByIdAsync(id);
        if (proposal == null)
            return NotFound();

        // Ensure customer owns this proposal
        if (proposal.CustomerId != customerId.Value)
            return Forbid();

        return Ok(_mapper.Map<CustomerProposalDto>(proposal));
    }

    /// <summary>
    /// Get proposal by reference number for the logged-in customer
    /// </summary>
    [HttpGet("by-reference/{referenceNumber}")]
    public async Task<ActionResult<CustomerProposalDto>> GetProposalByReference(string referenceNumber)
    {
        var customerId = GetCurrentCustomerId();
        if (customerId == null)
            return Unauthorized();

        var proposal = await _unitOfWork.Proposals.GetByReferenceNumberAsync(referenceNumber);
        if (proposal == null)
            return NotFound();

        if (proposal.CustomerId != customerId.Value)
            return Forbid();

        return Ok(_mapper.Map<CustomerProposalDto>(proposal));
    }

    /// <summary>
    /// Get pending proposals (awaiting signature)
    /// </summary>
    [HttpGet("pending")]
    public async Task<ActionResult<IEnumerable<CustomerProposalDto>>> GetPendingProposals()
    {
        var customerId = GetCurrentCustomerId();
        if (customerId == null)
            return Unauthorized();

        var pendingStatuses = new[] 
        { 
            ProposalStatus.PendingReview, 
            ProposalStatus.Viewed 
        };

        var proposals = await _unitOfWork.Proposals.FindAsync(p =>
            p.CustomerId == customerId.Value &&
            pendingStatuses.Contains(p.Status) &&
            (p.ValidUntil == null || p.ValidUntil > DateTime.UtcNow));

        return Ok(_mapper.Map<IEnumerable<CustomerProposalDto>>(proposals.OrderByDescending(p => p.CreatedAt)));
    }

    /// <summary>
    /// Get signed proposals
    /// </summary>
    [HttpGet("signed")]
    public async Task<ActionResult<IEnumerable<CustomerProposalDto>>> GetSignedProposals()
    {
        var customerId = GetCurrentCustomerId();
        if (customerId == null)
            return Unauthorized();

        var proposals = await _unitOfWork.Proposals.FindAsync(p =>
            p.CustomerId == customerId.Value &&
            p.Status == ProposalStatus.Signed);

        return Ok(_mapper.Map<IEnumerable<CustomerProposalDto>>(proposals.OrderByDescending(p => p.CreatedAt)));
    }

    /// <summary>
    /// Get summary statistics for the customer dashboard
    /// </summary>
    [HttpGet("summary")]
    public async Task<ActionResult<CustomerProposalSummaryDto>> GetSummary()
    {
        var customerId = GetCurrentCustomerId();
        if (customerId == null)
            return Unauthorized();

        var allProposals = await _unitOfWork.Proposals.FindAsync(p => p.CustomerId == customerId.Value);
        var proposalsList = allProposals.ToList();

        var pending = proposalsList.Count(p => 
            p.Status == ProposalStatus.PendingReview || 
            p.Status == ProposalStatus.Viewed);
        
        var signed = proposalsList.Count(p => p.Status == ProposalStatus.Signed);
        
        var expiringSoon = proposalsList.Count(p => 
            (p.Status == ProposalStatus.PendingReview || p.Status == ProposalStatus.Viewed) &&
            p.ValidUntil.HasValue && 
            p.ValidUntil.Value <= DateTime.UtcNow.AddDays(7));

        return Ok(new CustomerProposalSummaryDto(
            TotalProposals: proposalsList.Count,
            PendingSignature: pending,
            Signed: signed,
            ExpiringSoon: expiringSoon
        ));
    }

    private Guid? GetCurrentCustomerId()
    {
        var customerIdClaim = User.FindFirst("CustomerId")?.Value;
        if (Guid.TryParse(customerIdClaim, out var id))
            return id;
        return null;
    }
}
