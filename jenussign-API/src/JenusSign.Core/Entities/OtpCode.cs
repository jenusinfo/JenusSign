using JenusSign.Core.Enums;

namespace JenusSign.Core.Entities;

/// <summary>
/// OTP code entity for verification tracking
/// </summary>
public class OtpCode : BaseEntity
{
    // For signing session OTPs
    public Guid? SigningSessionId { get; set; }
    public SigningSession? SigningSession { get; set; }
    
    // For customer login OTPs
    public Guid? CustomerId { get; set; }
    public Customer? Customer { get; set; }
    
    // Token for identifying this OTP request (for customer login flow)
    public string? Token { get; set; }
    
    // Purpose of this OTP
    public OtpPurpose Purpose { get; set; } = OtpPurpose.Signing;
    
    public string Code { get; set; } = string.Empty;
    public string CodeHash { get; set; } = string.Empty; // Hashed version for security
    
    public OtpChannel Channel { get; set; }
    public string SentTo { get; set; } = string.Empty; // Email or phone
    public string? MaskedSentTo { get; set; } // For display: john.d***@email.com
    
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
    public DateTime? VerifiedAt { get; set; }
    
    public int Attempts { get; set; } = 0;
    public int MaxAttempts { get; set; } = 3;
    
    public bool IsVerified { get; set; } = false;
    public bool IsExpired => DateTime.UtcNow > ExpiresAt;
    public bool IsLocked => Attempts >= MaxAttempts;
    
    /// <summary>
    /// Generate a random 6-digit OTP
    /// </summary>
    public static string Generate()
    {
        var random = new Random();
        return random.Next(100000, 999999).ToString();
    }
    
    /// <summary>
    /// Mask email for display
    /// </summary>
    public static string MaskEmail(string email)
    {
        var parts = email.Split('@');
        if (parts.Length != 2) return email;
        
        var local = parts[0];
        var domain = parts[1];
        
        if (local.Length <= 3)
            return $"{local[0]}●●●●●@{domain}";
        
        return $"{local[..3]}●●●●●@{domain}";
    }
    
    /// <summary>
    /// Mask phone for display
    /// </summary>
    public static string MaskPhone(string phone)
    {
        if (phone.Length <= 4) return phone;
        return $"●●●●●●{phone[^4..]}";
    }
}
