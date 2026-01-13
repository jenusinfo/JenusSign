using JenusSign.Core.Enums;

namespace JenusSign.Core.Entities;

/// <summary>
/// Audit event for tracking all actions in a signing session
/// Required for eIDAS compliance and legal evidence
/// </summary>
public class AuditEvent : BaseEntity
{
    public Guid SigningSessionId { get; set; }
    public SigningSession SigningSession { get; set; } = null!;
    
    public ConsentAction Action { get; set; }
    public string ActionDescription { get; set; } = string.Empty;
    
    // Timestamp with precision
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public long TimestampTicks { get; set; } = DateTime.UtcNow.Ticks;
    
    // Device and network info
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? DeviceFingerprint { get; set; }
    
    // Additional data
    public string? Metadata { get; set; } // JSON for flexible data storage
    
    // For document-specific events
    public Guid? DocumentId { get; set; }
    public int? DocumentPage { get; set; }
    public int? ScrollPercentage { get; set; }
    
    // Verification status at time of event
    public bool? IdentityVerifiedAtEvent { get; set; }
    public bool? OtpVerifiedAtEvent { get; set; }
}
