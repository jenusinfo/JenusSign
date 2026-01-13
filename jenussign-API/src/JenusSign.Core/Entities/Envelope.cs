using JenusSign.Core.Enums;

namespace JenusSign.Core.Entities;

/// <summary>
/// Envelope for grouping multiple documents for single signing session
/// Business key: ENV-12345
/// </summary>
public class Envelope : BaseEntityWithBusinessKey
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    
    // Customer who will sign
    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    
    // Agent who created the envelope
    public Guid AgentId { get; set; }
    public User Agent { get; set; } = null!;
    
    // Documents in this envelope
    public ICollection<Proposal> Documents { get; set; } = new List<Proposal>();
    
    // Signing sessions for this envelope
    public ICollection<SigningSession> SigningSessions { get; set; } = new List<SigningSession>();
    
    // Status
    public ProposalStatus Status { get; set; } = ProposalStatus.Draft;
    
    // Expiry
    public DateTime? ExpiresAt { get; set; }
    
    // Message to customer
    public string? CustomerMessage { get; set; }
    
    /// <summary>
    /// Total number of documents in envelope
    /// </summary>
    public int DocumentCount => Documents.Count;
}
