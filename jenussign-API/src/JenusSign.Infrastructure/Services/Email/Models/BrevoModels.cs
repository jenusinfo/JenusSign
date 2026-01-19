namespace JenusSign.Infrastructure.Services.Email.Models;

/// <summary>
/// Brevo transactional email request
/// </summary>
public class TransactionalEmailRequest
{
    /// <summary>
    /// Sender information (must be verified in Brevo)
    /// </summary>
    public BrevoEmailContact Sender { get; set; } = new();

    /// <summary>
    /// List of recipients
    /// </summary>
    public List<BrevoEmailContact> To { get; set; } = [];

    /// <summary>
    /// CC recipients (optional)
    /// </summary>
    public List<BrevoEmailContact>? Cc { get; set; }

    /// <summary>
    /// BCC recipients (optional)
    /// </summary>
    public List<BrevoEmailContact>? Bcc { get; set; }

    /// <summary>
    /// Reply-to address (optional)
    /// </summary>
    public BrevoEmailContact? ReplyTo { get; set; }

    /// <summary>
    /// Email subject line
    /// </summary>
    public string Subject { get; set; } = string.Empty;

    /// <summary>
    /// HTML content of the email
    /// </summary>
    public string HtmlContent { get; set; } = string.Empty;

    /// <summary>
    /// Plain text content (optional, fallback for non-HTML clients)
    /// </summary>
    public string? TextContent { get; set; }

    /// <summary>
    /// Custom headers (optional)
    /// </summary>
    public Dictionary<string, string>? Headers { get; set; }

    /// <summary>
    /// Tags for categorization (optional)
    /// </summary>
    public List<string>? Tags { get; set; }
}

/// <summary>
/// Email contact with name and email address for Brevo API
/// </summary>
public class BrevoEmailContact
{
    /// <summary>
    /// Display name
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Email address
    /// </summary>
    public string Email { get; set; } = string.Empty;
}

/// <summary>
/// Response from transactional email send
/// </summary>
public class TransactionalEmailResponse
{
    /// <summary>
    /// Unique message ID returned by Brevo
    /// </summary>
    public string MessageId { get; set; } = string.Empty;
}

/// <summary>
/// Brevo API error response
/// </summary>
public class BrevoErrorResponse
{
    public string? Code { get; set; }
    public string? Message { get; set; }
}
