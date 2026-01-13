using AutoMapper;
using JenusSign.Application.DTOs;
using JenusSign.Core.Entities;
using JenusSign.Core.Enums;
using JenusSign.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace JenusSign.API.Controllers;

/// <summary>
/// Customer signing portal controller - handles the signing workflow
/// No authentication required - uses secure access tokens
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
public class SigningController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IOtpService _otpService;
    private readonly ISigningService _signingService;
    private readonly ITimestampService _timestampService;
    private readonly IPdfService _pdfService;
    private readonly IDocumentStorageService _documentStorage;
    private readonly IEmailService _emailService;
    private readonly ILogger<SigningController> _logger;
    private readonly string _baseUrl;

    public SigningController(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        IOtpService otpService,
        ISigningService signingService,
        ITimestampService timestampService,
        IPdfService pdfService,
        IDocumentStorageService documentStorage,
        IEmailService emailService,
        IConfiguration configuration,
        ILogger<SigningController> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _otpService = otpService;
        _signingService = signingService;
        _timestampService = timestampService;
        _pdfService = pdfService;
        _documentStorage = documentStorage;
        _emailService = emailService;
        _logger = logger;
        _baseUrl = configuration["App:BaseUrl"] ?? "https://jenussign.jenusplanet.com";
    }

    /// <summary>
    /// Get signing session info by access token
    /// </summary>
    [HttpGet("{accessToken}")]
    public async Task<ActionResult<CustomerSigningInfoDto>> GetSigningSession(string accessToken)
    {
        var session = await _unitOfWork.SigningSessions.GetByAccessTokenAsync(accessToken);
        if (session == null)
            return NotFound(new { message = "Invalid or expired signing link" });

        if (!session.IsValid)
            return BadRequest(new { message = "This signing link has expired" });

        // Record document view event
        await RecordAuditEvent(session, ConsentAction.DocumentViewed, "Customer accessed signing session");

        var documents = new List<DocumentInfoDto>();
        if (session.Proposal != null)
        {
            documents.Add(_mapper.Map<DocumentInfoDto>(session.Proposal));
        }
        else if (session.Envelope != null)
        {
            documents.AddRange(session.Envelope.Documents.Select(d => _mapper.Map<DocumentInfoDto>(d)));
        }

        var canSign = session.IdentityVerified && session.OtpVerified && 
                      session.Status != ProposalStatus.Signed;

        return Ok(new CustomerSigningInfoDto(
            SessionId: session.Id,
            CustomerName: session.Customer.DisplayName,
            CustomerEmail: session.Customer.Email,
            Status: session.Status,
            ExpiresAt: session.ExpiresAt,
            Documents: documents,
            IdentityVerified: session.IdentityVerified,
            OtpVerified: session.OtpVerified,
            CanSign: canSign
        ));
    }

    /// <summary>
    /// Verify customer identity
    /// </summary>
    [HttpPost("{accessToken}/verify-identity")]
    public async Task<ActionResult<VerifyIdentityResponse>> VerifyIdentity(
        string accessToken,
        [FromBody] VerifyIdentityRequest request)
    {
        var session = await _unitOfWork.SigningSessions.GetByAccessTokenAsync(accessToken);
        if (session == null || !session.IsValid)
            return NotFound(new { message = "Invalid or expired signing link" });

        // Verify identity matches customer record
        var customer = session.Customer;
        var nameMatch = string.Equals(
            request.FullName.Trim(), 
            customer.DisplayName, 
            StringComparison.OrdinalIgnoreCase);
        
        var idMatch = string.Equals(
            request.IdNumber?.Trim(), 
            customer.IdNumber, 
            StringComparison.OrdinalIgnoreCase);

        if (!nameMatch || !idMatch)
        {
            await RecordAuditEvent(session, ConsentAction.DocumentViewed, 
                "Identity verification failed - details do not match");
            
            return Ok(new VerifyIdentityResponse(
                Success: false,
                ErrorMessage: "The provided details do not match our records. Please check and try again.",
                FaceMatchScore: null
            ));
        }

        // Update session
        session.IdentityVerified = true;
        session.IdentityVerifiedAt = DateTime.UtcNow;
        session.VerifiedIdNumber = request.IdNumber;
        session.VerifiedName = request.FullName;
        session.VerificationMethod = request.Method;
        session.IpAddress = GetClientIpAddress();
        session.UserAgent = Request.Headers.UserAgent.ToString();

        await _unitOfWork.SigningSessions.UpdateAsync(session);
        await _unitOfWork.SaveChangesAsync();

        await RecordAuditEvent(session, ConsentAction.DocumentViewed, 
            $"Identity verified successfully using {request.Method}");

        _logger.LogInformation("Identity verified for session {SessionId}", session.Id);

        return Ok(new VerifyIdentityResponse(
            Success: true,
            ErrorMessage: null,
            FaceMatchScore: null
        ));
    }

    /// <summary>
    /// Request OTP for signing
    /// </summary>
    [HttpPost("{accessToken}/request-otp")]
    public async Task<ActionResult<RequestOtpResponse>> RequestOtp(
        string accessToken,
        [FromBody] RequestOtpRequest request)
    {
        var session = await _unitOfWork.SigningSessions.GetByAccessTokenAsync(accessToken);
        if (session == null || !session.IsValid)
            return NotFound(new { message = "Invalid or expired signing link" });

        if (!session.IdentityVerified)
            return BadRequest(new { message = "Please verify your identity first" });

        var result = await _otpService.SendOtpAsync(session, request.Channel);

        await RecordAuditEvent(session, ConsentAction.OtpRequested, 
            $"OTP requested via {request.Channel} to {result.MaskedDestination}");

        return Ok(new RequestOtpResponse(
            Success: result.Success,
            MaskedDestination: result.MaskedDestination,
            Channel: request.Channel,
            ExpiresAt: result.ExpiresAt,
            ErrorMessage: result.ErrorMessage
        ));
    }

    /// <summary>
    /// Verify OTP code
    /// </summary>
    [HttpPost("{accessToken}/verify-otp")]
    public async Task<ActionResult<VerifyOtpResponse>> VerifyOtp(
        string accessToken,
        [FromBody] VerifyOtpRequest request)
    {
        var session = await _unitOfWork.SigningSessions.GetByAccessTokenAsync(accessToken);
        if (session == null || !session.IsValid)
            return NotFound(new { message = "Invalid or expired signing link" });

        var result = await _otpService.VerifyOtpAsync(session.Id, request.Code);

        var action = result.Success ? ConsentAction.OtpVerified : ConsentAction.OtpRequested;
        await RecordAuditEvent(session, action, 
            result.Success ? "OTP verified successfully" : "OTP verification failed");

        return Ok(new VerifyOtpResponse(
            Success: result.Success,
            IsExpired: result.IsExpired,
            IsLocked: result.IsLocked,
            AttemptsRemaining: result.AttemptsRemaining,
            ErrorMessage: result.ErrorMessage
        ));
    }

    /// <summary>
    /// Complete signature
    /// </summary>
    [HttpPost("{accessToken}/sign")]
    public async Task<ActionResult<CompleteSignatureResponse>> CompleteSignature(
        string accessToken,
        [FromBody] CompleteSignatureRequest request)
    {
        var session = await _unitOfWork.SigningSessions.GetByAccessTokenAsync(accessToken);
        if (session == null || !session.IsValid)
            return NotFound(new { message = "Invalid or expired signing link" });

        if (!session.IdentityVerified || !session.OtpVerified)
            return BadRequest(new { message = "Please complete identity and OTP verification first" });

        if (!request.ConsentConfirmed)
            return BadRequest(new { message = "You must confirm consent to sign" });

        try
        {
            // Get document content
            byte[] documentContent;
            if (session.Proposal?.OriginalDocumentPath != null)
            {
                documentContent = await _documentStorage.GetDocumentAsync(session.Proposal.OriginalDocumentPath);
            }
            else
            {
                // For demo, create a placeholder
                documentContent = Array.Empty<byte>();
            }

            // Compute document hash (eIDAS Article 26 - Integrity)
            var documentHash = await _signingService.ComputeDocumentHashAsync(documentContent);
            session.DocumentHash = documentHash;

            // Apply digital signature (eIDAS Article 26 - Cryptographic signature)
            var signatureResult = await _signingService.SignDocumentAsync(documentHash, session);
            session.DigitalSignature = signatureResult.Signature;
            session.CertificateSerialNumber = signatureResult.CertificateSerialNumber;
            session.CertificateThumbprint = signatureResult.CertificateThumbprint;

            // Get trusted timestamp (RFC 3161)
            var timestampResult = await _timestampService.GetTimestampAsync(documentHash);
            session.TimestampToken = timestampResult.Token;
            session.TimestampedAt = timestampResult.Timestamp;
            session.TimestampAuthority = timestampResult.Authority;

            // Store signature data
            session.SignatureData = request.SignatureData;
            session.SignedAt = DateTime.UtcNow;
            session.Status = ProposalStatus.Signed;

            // Generate audit trail PDF
            var auditTrailPdf = await _pdfService.GenerateAuditTrailPdfAsync(session);
            var auditTrailPath = await _documentStorage.SaveDocumentAsync(
                auditTrailPdf,
                $"audit_trail_{session.BusinessKey}.pdf",
                "audit-trails");
            session.AuditTrailPdfPath = auditTrailPath;

            // Update proposal status
            if (session.Proposal != null)
            {
                session.Proposal.Status = ProposalStatus.Signed;
                session.Proposal.SignedDocumentHash = documentHash;
                await _unitOfWork.Proposals.UpdateAsync(session.Proposal);
            }

            await _unitOfWork.SigningSessions.UpdateAsync(session);
            await _unitOfWork.SaveChangesAsync();

            await RecordAuditEvent(session, ConsentAction.SignatureCompleted, 
                "Document signed successfully with AES");

            // Send confirmation email
            var downloadUrl = $"{_baseUrl}/verify/{session.ShortCode}";
            await _emailService.SendSigningCompletedAsync(session.Customer, downloadUrl);

            _logger.LogInformation("Document signed successfully for session {SessionId}", session.Id);

            return Ok(new CompleteSignatureResponse(
                Success: true,
                SignedDocumentUrl: downloadUrl,
                AuditTrailUrl: $"{_baseUrl}/api/v1/signing/{accessToken}/audit-trail",
                ErrorMessage: null
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to complete signature for session {SessionId}", session.Id);
            
            return Ok(new CompleteSignatureResponse(
                Success: false,
                SignedDocumentUrl: null,
                AuditTrailUrl: null,
                ErrorMessage: "An error occurred while processing your signature. Please try again."
            ));
        }
    }

    /// <summary>
    /// Verify document by short code
    /// </summary>
    [HttpGet("verify/{shortCode}")]
    public async Task<ActionResult<SigningSessionDto>> VerifyByShortCode(string shortCode)
    {
        var session = await _unitOfWork.SigningSessions.GetByShortCodeAsync(shortCode);
        if (session == null)
            return NotFound(new { message = "Document not found" });

        return Ok(_mapper.Map<SigningSessionDto>(session));
    }

    /// <summary>
    /// Download audit trail PDF
    /// </summary>
    [HttpGet("{accessToken}/audit-trail")]
    public async Task<ActionResult> GetAuditTrail(string accessToken)
    {
        var session = await _unitOfWork.SigningSessions.GetByAccessTokenAsync(accessToken);
        if (session == null)
            return NotFound();

        if (string.IsNullOrEmpty(session.AuditTrailPdfPath))
            return NotFound(new { message = "Audit trail not yet generated" });

        var content = await _documentStorage.GetDocumentAsync(session.AuditTrailPdfPath);
        return File(content, "application/pdf", $"audit_trail_{session.BusinessKey}.pdf");
    }

    private async Task RecordAuditEvent(SigningSession session, ConsentAction action, string description)
    {
        var auditEvent = new AuditEvent
        {
            SigningSessionId = session.Id,
            Action = action,
            ActionDescription = description,
            IpAddress = GetClientIpAddress(),
            UserAgent = Request.Headers.UserAgent.ToString(),
            IdentityVerifiedAtEvent = session.IdentityVerified,
            OtpVerifiedAtEvent = session.OtpVerified
        };

        await _unitOfWork.AuditEvents.AddAsync(auditEvent);
        await _unitOfWork.SaveChangesAsync();
    }

    private string GetClientIpAddress()
    {
        var forwardedFor = Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
            return forwardedFor.Split(',')[0].Trim();

        return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
    }
}
