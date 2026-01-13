using JenusSign.Core.Enums;

namespace JenusSign.Core.Entities;

/// <summary>
/// Signing session entity - tracks a complete signing workflow
/// Captures all eIDAS Article 26 requirements
/// </summary>
public class SigningSession : BaseEntityWithBusinessKey
{
    /// <summary>
    /// Unique secure token for customer access link
    /// </summary>
    public string AccessToken { get; set; } = Guid.NewGuid().ToString("N");
    
    /// <summary>
    /// Short token for QR code verification
    /// </summary>
    public string ShortCode { get; set; } = string.Empty;
    
    // References
    public Guid? ProposalId { get; set; }
    public Proposal? Proposal { get; set; }
    
    public Guid? EnvelopeId { get; set; }
    public Envelope? Envelope { get; set; }
    
    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    
    // Session status
    public ProposalStatus Status { get; set; } = ProposalStatus.PendingReview;
    public DateTime? ExpiresAt { get; set; }
    
    // Identity verification (eIDAS Article 26 - Uniquely linked to signatory)
    public VerificationMethod VerificationMethod { get; set; }
    public bool IdentityVerified { get; set; } = false;
    public DateTime? IdentityVerifiedAt { get; set; }
    public string? VerifiedIdNumber { get; set; }
    public string? VerifiedName { get; set; }
    public string? IdScanImagePath { get; set; }
    public string? SelfiePath { get; set; }
    public decimal? FaceMatchScore { get; set; }
    
    // OTP verification (eIDAS Article 26 - Sole control)
    public string? OtpCode { get; set; }
    public OtpChannel OtpChannel { get; set; }
    public string? OtpSentTo { get; set; }
    public DateTime? OtpSentAt { get; set; }
    public DateTime? OtpExpiresAt { get; set; }
    public DateTime? OtpVerifiedAt { get; set; }
    public int OtpAttempts { get; set; } = 0;
    public bool OtpVerified { get; set; } = false;
    
    // Signature data (eIDAS Article 26 - Capable of identifying signatory)
    public string? SignatureImagePath { get; set; }
    public string? SignatureData { get; set; } // Base64 or SVG
    public DateTime? SignedAt { get; set; }
    
    // Cryptographic data (eIDAS Article 26 - Detects subsequent changes)
    public string? DocumentHash { get; set; } // SHA-256 hash before signing
    public string? SignedDocumentHash { get; set; } // SHA-256 hash after signing
    public string? DigitalSignature { get; set; } // Cryptographic signature
    public string? CertificateSerialNumber { get; set; }
    public string? CertificateThumbprint { get; set; }
    
    // Timestamp (RFC 3161)
    public string? TimestampToken { get; set; }
    public DateTime? TimestampedAt { get; set; }
    public string? TimestampAuthority { get; set; }
    
    // Device and location info
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? DeviceInfo { get; set; }
    public string? GeoLocation { get; set; }
    
    // Audit trail
    public ICollection<AuditEvent> AuditEvents { get; set; } = new List<AuditEvent>();
    
    // Signature Evidence Record (final PDF)
    public string? AuditTrailPdfPath { get; set; }
    
    /// <summary>
    /// Check if session is still valid
    /// </summary>
    public bool IsValid => !ExpiresAt.HasValue || ExpiresAt > DateTime.UtcNow;
    
    /// <summary>
    /// Generate short code for QR verification
    /// </summary>
    public static string GenerateShortCode()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var random = new Random();
        return new string(Enumerable.Range(0, 8).Select(_ => chars[random.Next(chars.Length)]).ToArray());
    }
}
