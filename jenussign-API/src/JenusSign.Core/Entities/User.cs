using JenusSign.Core.Enums;

namespace JenusSign.Core.Entities;

/// <summary>
/// User entity for agents, brokers, employees, and admins
/// Business keys: BRK-001, AGT-001, EMP-001, ADM-001
/// </summary>
public class User : BaseEntityWithBusinessKey
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public UserRole Role { get; set; }
    
    /// <summary>
    /// For Agents: Reference to their Broker
    /// </summary>
    public Guid? BrokerId { get; set; }
    public User? Broker { get; set; }
    
    /// <summary>
    /// For Brokers: Collection of their agents
    /// </summary>
    public ICollection<User> Agents { get; set; } = new List<User>();
    
    /// <summary>
    /// Customers managed by this user (for Agents)
    /// </summary>
    public ICollection<Customer> Customers { get; set; } = new List<Customer>();
    
    /// <summary>
    /// Proposals created by this user
    /// </summary>
    public ICollection<Proposal> Proposals { get; set; } = new List<Proposal>();
    
    public bool IsActive { get; set; } = true;
    public DateTime? LastLoginAt { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiresAt { get; set; }
    
    /// <summary>
    /// Full name computed property
    /// </summary>
    public string FullName => $"{FirstName} {LastName}".Trim();
    
    /// <summary>
    /// Generate business key prefix based on role
    /// </summary>
    public static string GetBusinessKeyPrefix(UserRole role) => role switch
    {
        UserRole.Admin => "ADM",
        UserRole.Employee => "EMP",
        UserRole.Broker => "BRK",
        UserRole.Agent => "AGT",
        _ => "USR"
    };
}
