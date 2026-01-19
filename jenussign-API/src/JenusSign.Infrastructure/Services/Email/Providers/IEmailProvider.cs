using JenusSign.Infrastructure.Services.Email.Models;

namespace JenusSign.Infrastructure.Services.Email.Providers;

/// <summary>
/// Interface for email provider implementations
/// </summary>
public interface IEmailProvider
{
    /// <summary>
    /// Gets the provider type
    /// </summary>
    EmailProviderType ProviderType { get; }
    
    /// <summary>
    /// Sends an email message
    /// </summary>
    /// <param name="message">The email message to send</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Result of the send operation</returns>
    Task<EmailSendResult> SendAsync(EmailMessage message, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Tests the connection/configuration of the email provider
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if configuration is valid</returns>
    Task<bool> TestConnectionAsync(CancellationToken cancellationToken = default);
}
