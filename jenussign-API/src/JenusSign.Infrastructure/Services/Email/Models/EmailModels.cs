namespace JenusSign.Infrastructure.Services.Email.Models;

/// <summary>
/// Email provider type enumeration
/// </summary>
public enum EmailProviderType
{
    /// <summary>
    /// SMTP-based email (Gmail, Office365, etc.)
    /// </summary>
    Smtp,
    
    /// <summary>
    /// Brevo (formerly Sendinblue) API
    /// </summary>
    Brevo
}

/// <summary>
/// Email configuration options
/// </summary>
public class EmailOptions
{
    public const string SectionName = "Email";
    
    /// <summary>
    /// The email provider to use (Smtp or Brevo)
    /// </summary>
    public EmailProviderType Provider { get; set; } = EmailProviderType.Smtp;
}

/// <summary>
/// Mail settings configuration (for Gmail, Office365, etc.)
/// </summary>
public class MailSettings
{
    public const string SectionName = "MailSettings";
    
    /// <summary>
    /// Sender email address
    /// </summary>
    public string Mail { get; set; } = string.Empty;
    
    /// <summary>
    /// Sender display name
    /// </summary>
    public string DisplayName { get; set; } = "JenusSign";
    
    /// <summary>
    /// SMTP password or app password
    /// </summary>
    public string Password { get; set; } = string.Empty;
    
    /// <summary>
    /// SMTP server host
    /// </summary>
    public string Host { get; set; } = "smtp.gmail.com";
    
    /// <summary>
    /// SMTP server port
    /// </summary>
    public int Port { get; set; } = 587;
}

/// <summary>
/// Brevo API configuration options
/// </summary>
public class BrevoOptions
{
    public const string SectionName = "Brevo";
    
    /// <summary>
    /// Brevo API base URL
    /// </summary>
    public string BaseUrl { get; set; } = "https://api.brevo.com/v3/";
    
    /// <summary>
    /// Brevo API key
    /// </summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>
/// Email contact with name and email
/// </summary>
public class EmailContact
{
    public string? Name { get; set; }
    public string Email { get; set; } = string.Empty;
}

/// <summary>
/// Email message to be sent
/// </summary>
public class EmailMessage
{
    public EmailContact From { get; set; } = new();
    public List<EmailContact> To { get; set; } = new();
    public List<EmailContact>? Cc { get; set; }
    public List<EmailContact>? Bcc { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string? TextContent { get; set; }
    public string? HtmlContent { get; set; }
    public List<EmailAttachment>? Attachments { get; set; }
}

/// <summary>
/// Email attachment
/// </summary>
public class EmailAttachment
{
    public string Name { get; set; } = string.Empty;
    public byte[] Content { get; set; } = Array.Empty<byte>();
    public string ContentType { get; set; } = "application/octet-stream";
}

/// <summary>
/// Result of email send operation
/// </summary>
public class EmailSendResult
{
    public bool IsSuccess { get; set; }
    public string? MessageId { get; set; }
    public string? ErrorMessage { get; set; }
    public int StatusCode { get; set; }

    public static EmailSendResult Success(string? messageId = null) => new()
    {
        IsSuccess = true,
        MessageId = messageId,
        StatusCode = 200
    };

    public static EmailSendResult Failure(string errorMessage, int statusCode = 500) => new()
    {
        IsSuccess = false,
        ErrorMessage = errorMessage,
        StatusCode = statusCode
    };
}
