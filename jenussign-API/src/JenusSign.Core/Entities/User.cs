using JenusSign.Core.Enums;
using Microsoft.AspNetCore.Identity;

namespace JenusSign.Core.Entities;

/// <summary>
/// Identity-backed user with domain fields and business keys.
/// </summary>
public class User : IdentityUser<Guid>
{
    // Domain fields
    public string BusinessKey { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public UserRole Role { get; set; }
    public Guid? BrokerId { get; set; }
    public User? Broker { get; set; }
    public ICollection<User> Agents { get; set; } = new List<User>();
    public ICollection<Customer> Customers { get; set; } = new List<Customer>();
    public ICollection<Proposal> Proposals { get; set; } = new List<Proposal>();
    public bool IsActive { get; set; } = true;
    public DateTime? LastLoginAt { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiresAt { get; set; }

    // Auditing / soft-delete
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }

    public string FullName => $"{FirstName} {LastName}".Trim();

    public static string GetBusinessKeyPrefix(UserRole role) => role switch
    {
        UserRole.Admin => "ADM",
        UserRole.Employee => "EMP",
        UserRole.Broker => "BRK",
        UserRole.Agent => "AGT",
        _ => "USR"
    };
}
