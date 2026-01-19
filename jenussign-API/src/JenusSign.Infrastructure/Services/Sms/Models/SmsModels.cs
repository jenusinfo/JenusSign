namespace JenusSign.Infrastructure.Services.Sms.Models;

/// <summary>
/// SMS provider type enumeration
/// </summary>
public enum SmsProviderType
{
    /// <summary>
    /// Twilio SMS provider
    /// </summary>
    Twilio,
    
    /// <summary>
    /// Brevo (formerly Sendinblue) SMS API
    /// </summary>
    Brevo,
    
    /// <summary>
    /// Mock provider for development/testing
    /// </summary>
    Mock
}

/// <summary>
/// SMS configuration options
/// </summary>
public class SmsOptions
{
    public const string SectionName = "Sms";
    
    /// <summary>
    /// The SMS provider to use
    /// </summary>
    public SmsProviderType Provider { get; set; } = SmsProviderType.Mock;
}

/// <summary>
/// Brevo SMS configuration options
/// </summary>
public class BrevoSmsOptions
{
    public const string SectionName = "BrevoSms";
    
    /// <summary>
    /// Brevo API base URL
    /// </summary>
    public string BaseUrl { get; set; } = "https://api.brevo.com/v3/";
    
    /// <summary>
    /// Brevo API key
    /// </summary>
    public string ApiKey { get; set; } = string.Empty;
    
    /// <summary>
    /// Sender name (max 11 alphanumeric characters)
    /// </summary>
    public string Sender { get; set; } = "JenusSign";
    
    /// <summary>
    /// SMS type: transactional or marketing
    /// </summary>
    public string Type { get; set; } = "transactional";
    
    /// <summary>
    /// Enable unicode characters
    /// </summary>
    public bool UnicodeEnabled { get; set; } = true;
    
    /// <summary>
    /// Organisation prefix
    /// </summary>
    public string? OrganisationPrefix { get; set; }
}

/// <summary>
/// Brevo SMS request
/// </summary>
public class BrevoSmsRequest
{
    /// <summary>
    /// Sender name (max 11 alphanumeric characters for alphanumeric sender)
    /// </summary>
    public string Sender { get; set; } = string.Empty;
    
    /// <summary>
    /// Recipient phone number with country code (e.g., "35799511530")
    /// </summary>
    public string Recipient { get; set; } = string.Empty;
    
    /// <summary>
    /// SMS content
    /// </summary>
    public string Content { get; set; } = string.Empty;
    
    /// <summary>
    /// SMS type: "transactional" or "marketing"
    /// </summary>
    public string Type { get; set; } = "transactional";
    
    /// <summary>
    /// Tag for categorization
    /// </summary>
    public string? Tag { get; set; }
    
    /// <summary>
    /// Web URL for tracking
    /// </summary>
    public string? WebUrl { get; set; }
    
    /// <summary>
    /// Enable unicode characters in SMS
    /// </summary>
    public bool UnicodeEnabled { get; set; } = true;
    
    /// <summary>
    /// Organisation prefix
    /// </summary>
    public string? OrganisationPrefix { get; set; }
}

/// <summary>
/// Brevo SMS response
/// </summary>
public class BrevoSmsResponse
{
    /// <summary>
    /// Message ID returned by Brevo
    /// </summary>
    public long MessageId { get; set; }
    
    /// <summary>
    /// Number of SMS credits used
    /// </summary>
    public decimal? SmsCount { get; set; }
    
    /// <summary>
    /// Remaining SMS credits
    /// </summary>
    public decimal? UsedCredits { get; set; }
    
    /// <summary>
    /// Remaining credits
    /// </summary>
    public decimal? RemainingCredits { get; set; }
}

/// <summary>
/// Brevo SMS error response
/// </summary>
public class BrevoSmsErrorResponse
{
    public string? Code { get; set; }
    public string? Message { get; set; }
}

/// <summary>
/// Result of SMS send operation
/// </summary>
public class SmsSendResult
{
    public bool IsSuccess { get; set; }
    public string? MessageId { get; set; }
    public string? ErrorMessage { get; set; }
    public int StatusCode { get; set; }

    public static SmsSendResult Success(string? messageId = null) => new()
    {
        IsSuccess = true,
        MessageId = messageId,
        StatusCode = 200
    };

    public static SmsSendResult Failure(string errorMessage, int statusCode = 500) => new()
    {
        IsSuccess = false,
        ErrorMessage = errorMessage,
        StatusCode = statusCode
    };
}
