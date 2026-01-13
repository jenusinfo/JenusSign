using JenusSign.Core.Enums;

namespace JenusSign.Core.Entities;

/// <summary>
/// Customer entity - individuals or corporations
/// Business key: CUST-12345
/// </summary>
public class Customer : BaseEntityWithBusinessKey
{
    public CustomerType CustomerType { get; set; } = CustomerType.Individual;
    
    // Personal details (for Individual)
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime? DateOfBirth { get; set; }
    
    // Corporate details
    public string? CompanyName { get; set; }
    public string? RegistrationNumber { get; set; }
    public string? VatNumber { get; set; }
    
    // Contact information
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? AlternatePhone { get; set; }
    
    // Address
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Country { get; set; } = "Cyprus";
    
    // Identity documents
    public string? IdNumber { get; set; }
    public string? IdType { get; set; } // ID Card, Passport, etc.
    public DateTime? IdExpiryDate { get; set; }
    
    // Navins integration
    public string? NavinsCustomerId { get; set; }
    
    // Agent relationship
    public Guid AgentId { get; set; }
    public User Agent { get; set; } = null!;
    
    // Proposals for this customer
    public ICollection<Proposal> Proposals { get; set; } = new List<Proposal>();
    
    // Signing sessions
    public ICollection<SigningSession> SigningSessions { get; set; } = new List<SigningSession>();
    
    /// <summary>
    /// Display name - company name for corporate, full name for individual
    /// </summary>
    public string DisplayName => CustomerType == CustomerType.Corporate 
        ? CompanyName ?? $"{FirstName} {LastName}".Trim()
        : $"{FirstName} {LastName}".Trim();
}
