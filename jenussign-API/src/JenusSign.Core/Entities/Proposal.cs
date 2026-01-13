using JenusSign.Core.Enums;

namespace JenusSign.Core.Entities;

/// <summary>
/// Insurance proposal document entity
/// Business key: PROP-12345
/// </summary>
public class Proposal : BaseEntityWithBusinessKey
{
    /// <summary>
    /// Human-readable reference number (e.g., PR-2025-0001)
    /// </summary>
    public string ReferenceNumber { get; set; } = string.Empty;
    
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ProposalType ProposalType { get; set; }
    public ProposalStatus Status { get; set; } = ProposalStatus.Draft;
    
    // Financial details
    public decimal? SumInsured { get; set; }
    public decimal? Premium { get; set; }
    public decimal? Excess { get; set; }
    public string Currency { get; set; } = "EUR";
    
    // Dates
    public DateTime IssueDate { get; set; } = DateTime.UtcNow;
    public DateTime? ValidUntil { get; set; }
    public DateTime? PolicyStartDate { get; set; }
    public DateTime? PolicyEndDate { get; set; }
    
    // Customer relationship
    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    
    // Agent who created it
    public Guid AgentId { get; set; }
    public User Agent { get; set; } = null!;
    
    // Document storage
    public string? OriginalDocumentPath { get; set; }
    public string? OriginalDocumentHash { get; set; }
    public string? SignedDocumentPath { get; set; }
    public string? SignedDocumentHash { get; set; }
    public long? DocumentSize { get; set; }
    public int? DocumentPages { get; set; }
    
    // Navins integration
    public string? NavinsProposalId { get; set; }
    
    // Signing configuration
    public SignatureType RequiredSignatureType { get; set; } = SignatureType.AES;
    
    // Related documents in envelope
    public Guid? EnvelopeId { get; set; }
    public Envelope? Envelope { get; set; }
    public int? EnvelopeOrder { get; set; }
    
    // Signing session
    public ICollection<SigningSession> SigningSessions { get; set; } = new List<SigningSession>();
    
    /// <summary>
    /// Generate reference number based on year and sequence
    /// </summary>
    public static string GenerateReferenceNumber(int year, int sequence)
    {
        return $"PR-{year}-{sequence:D4}";
    }
}
