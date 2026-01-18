using System.Linq.Expressions;
using System.Security.Claims;
using AutoMapper;
using JenusSign.Application.DTOs;
using JenusSign.Core.Entities;
using JenusSign.Core.Enums;
using JenusSign.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JenusSign.API.Controllers;

/// <summary>
/// Envelope management - grouping multiple documents for signing
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class EnvelopesController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IEmailService _emailService;
    private readonly IDocumentStorageService _documentStorage;
    private readonly ILogger<EnvelopesController> _logger;
    private readonly string _baseUrl;

    public EnvelopesController(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        IEmailService emailService,
        IDocumentStorageService documentStorage,
        IConfiguration configuration,
        ILogger<EnvelopesController> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _emailService = emailService;
        _documentStorage = documentStorage;
        _logger = logger;
        _baseUrl = configuration["App:BaseUrl"] ?? "https://jenussign.jenusplanet.com";
    }

    /// <summary>
    /// Get envelopes based on user role
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<EnvelopeListResponse>> GetEnvelopes(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] ProposalStatus? status = null,
        [FromQuery] string? search = null)
    {
        var (userId, role, _) = GetCurrentUserContext();
        var searchLower = search?.ToLowerInvariant();
        var isAgent = role == UserRole.Agent;
        var isBroker = role == UserRole.Broker;

        Expression<Func<Envelope, bool>> predicate = e =>
            (!isAgent || e.AgentId == userId) &&
            (!isBroker || (e.Agent != null && e.Agent.BrokerId == userId)) &&
            (!status.HasValue || e.Status == status.Value) &&
            (string.IsNullOrWhiteSpace(searchLower) ||
                e.BusinessKey.ToLower().Contains(searchLower) ||
                e.Name.ToLower().Contains(searchLower) ||
                (e.Customer != null && e.Customer.DisplayName.ToLower().Contains(searchLower)));

        var includes = new Expression<Func<Envelope, object>>[]
        {
            e => e.Customer,
            e => e.Agent,
            e => e.Documents
        };

        var totalCount = await _unitOfWork.Envelopes.CountAsync(predicate);

        var envelopes = await _unitOfWork.Envelopes.GetAllAsync(
            predicate: predicate,
            orderBy: q => q.OrderByDescending(e => e.CreatedAt),
            page: page,
            pageSize: pageSize,
            includes: includes);

        return Ok(new EnvelopeListResponse(
            Envelopes: _mapper.Map<IEnumerable<EnvelopeDto>>(envelopes),
            TotalCount: totalCount,
            Page: page,
            PageSize: pageSize
        ));
    }

    /// <summary>
    /// Get envelope by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<EnvelopeDto>> GetEnvelope(Guid id)
    {
        var envelope = await GetEnvelopeWithIncludesAsync(id);
        if (envelope == null)
            return NotFound();

        if (!CanAccessEnvelope(envelope))
            return Forbid();

        return Ok(_mapper.Map<EnvelopeDto>(envelope));
    }

    /// <summary>
    /// Get envelope by business key
    /// </summary>
    [HttpGet("by-key/{businessKey}")]
    public async Task<ActionResult<EnvelopeDto>> GetEnvelopeByBusinessKey(string businessKey)
    {
        var envelopes = await _unitOfWork.Envelopes.FindAsync(e => e.BusinessKey == businessKey);
        var envelope = envelopes.FirstOrDefault();
        
        if (envelope == null)
            return NotFound();

        if (!CanAccessEnvelope(envelope))
            return Forbid();

        return Ok(_mapper.Map<EnvelopeDto>(envelope));
    }

    /// <summary>
    /// Get envelope by access token (for signing portal - no auth required)
    /// </summary>
    [HttpGet("by-token/{token}")]
    [AllowAnonymous]
    public async Task<ActionResult<EnvelopeSigningInfoDto>> GetEnvelopeByToken(string token)
    {
        var session = await _unitOfWork.SigningSessions.GetByAccessTokenAsync(token);
        if (session == null || session.EnvelopeId == null)
            return NotFound(new { message = "Invalid or expired signing link" });

        if (!session.IsValid)
            return BadRequest(new { message = "This signing link has expired" });

        var envelope = await GetEnvelopeWithIncludesAsync(session.EnvelopeId.Value);
        if (envelope == null)
            return NotFound();

        var documents = envelope.Documents.Select(d => new DocumentInfoDto(
            d.Id,
            d.Title,
            d.ReferenceNumber,
            null, // Pages
            $"{_baseUrl}/api/v1/documents/{d.Id}/download"
        )).ToList();

        return Ok(new EnvelopeSigningInfoDto(
            EnvelopeId: envelope.Id,
            BusinessKey: envelope.BusinessKey,
            Name: envelope.Name,
            Description: envelope.Description,
            CustomerName: envelope.Customer.DisplayName,
            CustomerEmail: envelope.Customer.Email,
            Status: envelope.Status,
            ExpiresAt: envelope.ExpiresAt,
            Documents: documents,
            CustomerMessage: envelope.CustomerMessage,
            IdentityVerified: session.IdentityVerified,
            OtpVerified: session.OtpVerified,
            CanSign: session.IdentityVerified && session.OtpVerified && envelope.Status != ProposalStatus.Signed
        ));
    }

    /// <summary>
    /// Create new envelope
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<EnvelopeDto>> CreateEnvelope([FromBody] CreateEnvelopeRequest request)
    {
        var (userId, _, _) = GetCurrentUserContext();

        // Verify customer exists
        var customer = await _unitOfWork.Customers.GetByIdAsync(request.CustomerId);
        if (customer == null)
            return BadRequest(new { message = "Customer not found" });

        // Generate business key
        var count = await _unitOfWork.Envelopes.CountAsync();
        var businessKey = $"ENV-{(count + 1):D5}";

        var envelope = new Envelope
        {
            BusinessKey = businessKey,
            Name = request.Name,
            Description = request.Description,
            CustomerId = request.CustomerId,
            AgentId = userId,
            CustomerMessage = request.CustomerMessage,
            ExpiresAt = request.ExpiresAt ?? DateTime.UtcNow.AddDays(30),
            Status = ProposalStatus.Draft
        };

        await _unitOfWork.Envelopes.AddAsync(envelope);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Envelope {BusinessKey} created for customer {CustomerId}", 
            businessKey, customer.BusinessKey);

        envelope = await GetEnvelopeWithIncludesAsync(envelope.Id);
        return CreatedAtAction(nameof(GetEnvelope), new { id = envelope!.Id }, _mapper.Map<EnvelopeDto>(envelope));
    }

    /// <summary>
    /// Update envelope
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<EnvelopeDto>> UpdateEnvelope(Guid id, [FromBody] UpdateEnvelopeRequest request)
    {
        var envelope = await GetEnvelopeWithIncludesAsync(id);
        if (envelope == null)
            return NotFound();

        if (!CanAccessEnvelope(envelope))
            return Forbid();

        if (envelope.Status == ProposalStatus.Signed)
            return BadRequest(new { message = "Cannot update a signed envelope" });

        if (request.Name != null) envelope.Name = request.Name;
        if (request.Description != null) envelope.Description = request.Description;
        if (request.CustomerMessage != null) envelope.CustomerMessage = request.CustomerMessage;
        if (request.ExpiresAt.HasValue) envelope.ExpiresAt = request.ExpiresAt.Value;

        await _unitOfWork.Envelopes.UpdateAsync(envelope);
        await _unitOfWork.SaveChangesAsync();

        return Ok(_mapper.Map<EnvelopeDto>(envelope));
    }

    /// <summary>
    /// Delete envelope (soft delete)
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteEnvelope(Guid id)
    {
        var envelope = await _unitOfWork.Envelopes.GetByIdAsync(id);
        if (envelope == null)
            return NotFound();

        if (envelope.Status == ProposalStatus.Signed)
            return BadRequest(new { message = "Cannot delete a signed envelope" });

        await _unitOfWork.Envelopes.DeleteAsync(envelope);
        await _unitOfWork.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Add document (proposal) to envelope
    /// </summary>
    [HttpPost("{id:guid}/documents")]
    public async Task<ActionResult<EnvelopeDto>> AddDocument(Guid id, [FromBody] AddDocumentToEnvelopeRequest request)
    {
        var envelope = await GetEnvelopeWithIncludesAsync(id);
        if (envelope == null)
            return NotFound();

        if (!CanAccessEnvelope(envelope))
            return Forbid();

        if (envelope.Status != ProposalStatus.Draft)
            return BadRequest(new { message = "Can only add documents to draft envelopes" });

        var proposal = await _unitOfWork.Proposals.GetByIdAsync(request.ProposalId);
        if (proposal == null)
            return BadRequest(new { message = "Proposal not found" });

        if (proposal.CustomerId != envelope.CustomerId)
            return BadRequest(new { message = "Proposal must belong to the same customer" });

        // Add to envelope
        proposal.EnvelopeId = envelope.Id;
        await _unitOfWork.Proposals.UpdateAsync(proposal);
        await _unitOfWork.SaveChangesAsync();

        envelope = await GetEnvelopeWithIncludesAsync(id);
        return Ok(_mapper.Map<EnvelopeDto>(envelope));
    }

    /// <summary>
    /// Remove document from envelope
    /// </summary>
    [HttpDelete("{id:guid}/documents/{proposalId:guid}")]
    public async Task<ActionResult<EnvelopeDto>> RemoveDocument(Guid id, Guid proposalId)
    {
        var envelope = await GetEnvelopeWithIncludesAsync(id);
        if (envelope == null)
            return NotFound();

        if (!CanAccessEnvelope(envelope))
            return Forbid();

        if (envelope.Status != ProposalStatus.Draft)
            return BadRequest(new { message = "Can only remove documents from draft envelopes" });

        var proposal = envelope.Documents.FirstOrDefault(d => d.Id == proposalId);
        if (proposal == null)
            return NotFound(new { message = "Document not found in envelope" });

        proposal.EnvelopeId = null;
        await _unitOfWork.Proposals.UpdateAsync(proposal);
        await _unitOfWork.SaveChangesAsync();

        envelope = await GetEnvelopeWithIncludesAsync(id);
        return Ok(_mapper.Map<EnvelopeDto>(envelope));
    }

    /// <summary>
    /// Send envelope for signing
    /// </summary>
    [HttpPost("{id:guid}/send")]
    public async Task<ActionResult<SigningSessionAccessResponse>> SendForSigning(
        Guid id,
        [FromBody] SendEnvelopeRequest request)
    {
        var envelope = await GetEnvelopeWithIncludesAsync(id);
        if (envelope == null)
            return NotFound();

        if (!CanAccessEnvelope(envelope))
            return Forbid();

        if (!envelope.Documents.Any())
            return BadRequest(new { message = "Envelope must contain at least one document" });

        // Create signing session
        var session = new SigningSession
        {
            BusinessKey = $"SES-{Guid.NewGuid().ToString("N")[..8].ToUpper()}",
            EnvelopeId = envelope.Id,
            CustomerId = envelope.CustomerId,
            ShortCode = SigningSession.GenerateShortCode(),
            ExpiresAt = request.ExpiresAt ?? envelope.ExpiresAt ?? DateTime.UtcNow.AddDays(7),
            Status = ProposalStatus.PendingReview
        };

        await _unitOfWork.SigningSessions.AddAsync(session);

        // Update envelope status
        envelope.Status = ProposalStatus.PendingReview;
        await _unitOfWork.Envelopes.UpdateAsync(envelope);

        // Update all document statuses
        foreach (var doc in envelope.Documents)
        {
            doc.Status = ProposalStatus.PendingReview;
            await _unitOfWork.Proposals.UpdateAsync(doc);
        }

        await _unitOfWork.SaveChangesAsync();

        var accessUrl = $"{_baseUrl}/sign/{session.AccessToken}";

        // Send email notification
        if (request.SendEmail)
        {
            await _emailService.SendSigningRequestAsync(
                envelope.Customer,
                accessUrl,
                request.CustomerMessage ?? envelope.CustomerMessage);
        }

        _logger.LogInformation("Envelope {BusinessKey} sent for signing, session {SessionId}",
            envelope.BusinessKey, session.Id);

        return Ok(new SigningSessionAccessResponse(
            SessionId: session.Id,
            AccessUrl: accessUrl,
            ShortCode: session.ShortCode,
            ExpiresAt: session.ExpiresAt ?? DateTime.UtcNow.AddDays(7)
        ));
    }

    /// <summary>
    /// Get envelopes for the current customer (Customer Portal)
    /// </summary>
    [HttpGet("customer")]
    [Authorize(Policy = "CustomerPolicy")]
    public async Task<ActionResult<EnvelopeListResponse>> GetCustomerEnvelopes(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] ProposalStatus? status = null)
    {
        var customerId = User.FindFirst("CustomerId")?.Value;
        if (!Guid.TryParse(customerId, out var id))
            return Unauthorized();

        Expression<Func<Envelope, bool>> predicate = e =>
            e.CustomerId == id &&
            (!status.HasValue || e.Status == status.Value);

        var totalCount = await _unitOfWork.Envelopes.CountAsync(predicate);

        var envelopes = await _unitOfWork.Envelopes.GetAllAsync(
            predicate: predicate,
            orderBy: q => q.OrderByDescending(e => e.CreatedAt),
            page: page,
            pageSize: pageSize);

        return Ok(new EnvelopeListResponse(
            Envelopes: _mapper.Map<IEnumerable<EnvelopeDto>>(envelopes),
            TotalCount: totalCount,
            Page: page,
            PageSize: pageSize
        ));
    }

    /// <summary>
    /// Get envelopes by customer ID
    /// </summary>
    [HttpGet("by-customer/{customerId:guid}")]
    public async Task<ActionResult<IEnumerable<EnvelopeDto>>> GetEnvelopesByCustomer(Guid customerId)
    {
        var envelopes = await _unitOfWork.Envelopes.FindAsync(e => e.CustomerId == customerId);
        return Ok(_mapper.Map<IEnumerable<EnvelopeDto>>(envelopes));
    }

    private async Task<Envelope?> GetEnvelopeWithIncludesAsync(Guid id)
    {
        var includes = new Expression<Func<Envelope, object>>[]
        {
            e => e.Customer,
            e => e.Agent,
            e => e.Documents
        };

        var envelopes = await _unitOfWork.Envelopes.GetAllAsync(
            predicate: e => e.Id == id,
            includes: includes);

        return envelopes.FirstOrDefault();
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

    private bool CanAccessEnvelope(Envelope envelope)
    {
        var (userId, role, _) = GetCurrentUserContext();

        return role switch
        {
            UserRole.Admin or UserRole.Employee => true,
            UserRole.Agent => envelope.AgentId == userId,
            UserRole.Broker => envelope.Agent?.BrokerId == userId,
            _ => false
        };
    }
}
