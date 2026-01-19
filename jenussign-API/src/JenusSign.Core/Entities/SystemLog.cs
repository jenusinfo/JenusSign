namespace JenusSign.Core.Entities;

/// <summary>
/// System-wide audit log for tracking all system events
/// </summary>
public class SystemLog : BaseEntity
{
    /// <summary>
    /// Timestamp when the event occurred
    /// </summary>
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// Type of event (e.g., EMAIL_SENT, LOGIN_SUCCESS, ENVELOPE_CREATED)
    /// </summary>
    public string EventType { get; set; } = string.Empty;
    
    /// <summary>
    /// Severity level: INFO, WARNING, ERROR
    /// </summary>
    public string Severity { get; set; } = "INFO";
    
    /// <summary>
    /// Human-readable description of the event
    /// </summary>
    public string Message { get; set; } = string.Empty;
    
    /// <summary>
    /// Optional: Related envelope ID
    /// </summary>
    public Guid? EnvelopeId { get; set; }
    public Envelope? Envelope { get; set; }
    
    /// <summary>
    /// Optional: Related envelope reference/business key
    /// </summary>
    public string? EnvelopeRef { get; set; }
    
    /// <summary>
    /// Optional: Related customer ID
    /// </summary>
    public Guid? CustomerId { get; set; }
    public Customer? Customer { get; set; }
    
    /// <summary>
    /// Optional: Related customer name (denormalized for quick display)
    /// </summary>
    public string? CustomerName { get; set; }
    
    /// <summary>
    /// Optional: Related user ID (who performed the action)
    /// </summary>
    public Guid? UserId { get; set; }
    public User? User { get; set; }
    
    /// <summary>
    /// Optional: Related user name (denormalized for quick display)
    /// </summary>
    public string? UserName { get; set; }
    
    /// <summary>
    /// IP address of the request
    /// </summary>
    public string? IpAddress { get; set; }
    
    /// <summary>
    /// User agent string
    /// </summary>
    public string? UserAgent { get; set; }
    
    /// <summary>
    /// JSON metadata for additional context
    /// </summary>
    public string? Metadata { get; set; }
}
