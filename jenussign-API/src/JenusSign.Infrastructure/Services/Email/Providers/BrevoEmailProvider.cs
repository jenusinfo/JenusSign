using System.Text;
using System.Text.Json;
using JenusSign.Infrastructure.Services.Email.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace JenusSign.Infrastructure.Services.Email.Providers;

/// <summary>
/// Email provider implementation using Brevo (formerly Sendinblue) API
/// </summary>
public class BrevoEmailProvider : IEmailProvider
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<BrevoEmailProvider> _logger;
    private readonly BrevoOptions _options;
    private readonly JsonSerializerOptions _jsonOptions;

    public BrevoEmailProvider(
        HttpClient httpClient,
        IOptions<BrevoOptions> options,
        ILogger<BrevoEmailProvider> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _options = options.Value;

        // Ensure base URL ends with trailing slash for proper URI resolution
        var baseUrl = _options.BaseUrl.TrimEnd('/') + "/";
        _httpClient.BaseAddress = new Uri(baseUrl);
        
        // Clear any existing headers and set fresh ones
        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Add("api-key", _options.ApiKey);
        _httpClient.DefaultRequestHeaders.Add("accept", "application/json");

        _logger.LogDebug("BrevoEmailProvider configured with BaseUrl: {BaseUrl}", baseUrl);

        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
        };
    }

    public EmailProviderType ProviderType => EmailProviderType.Brevo;

    public async Task<EmailSendResult> SendAsync(EmailMessage message, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Sending email via Brevo to: {Recipients}", 
                string.Join(", ", message.To.Select(t => t.Email)));

            var brevoRequest = MapToBrevoRequest(message);
            var json = JsonSerializer.Serialize(brevoRequest, _jsonOptions);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("smtp/email", content, cancellationToken);
            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                var result = JsonSerializer.Deserialize<TransactionalEmailResponse>(responseContent, _jsonOptions);
                var messageId = result?.MessageId;
                
                _logger.LogInformation("Brevo email sent successfully. MessageId: {MessageId}", messageId);
                return EmailSendResult.Success(messageId);
            }

            var error = JsonSerializer.Deserialize<BrevoErrorResponse>(responseContent, _jsonOptions);
            _logger.LogWarning("Brevo failed to send email: {Error} (Code: {Code})", error?.Message, error?.Code);
            return EmailSendResult.Failure(
                error?.Message ?? "Unknown error from Brevo",
                (int)response.StatusCode);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "HTTP error while sending email via Brevo");
            return EmailSendResult.Failure($"HTTP error: {ex.Message}", 503);
        }
        catch (TaskCanceledException ex) when (ex.CancellationToken == cancellationToken)
        {
            _logger.LogWarning("Brevo email send was cancelled");
            return EmailSendResult.Failure("Request was cancelled", 499);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception while sending email via Brevo");
            return EmailSendResult.Failure(ex.Message, 500);
        }
    }

    public async Task<bool> TestConnectionAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            // Test by calling the account endpoint
            var response = await _httpClient.GetAsync("account", cancellationToken);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to test Brevo connection");
            return false;
        }
    }

    private static TransactionalEmailRequest MapToBrevoRequest(EmailMessage message)
    {
        var request = new TransactionalEmailRequest
        {
            Sender = new BrevoEmailContact
            {
                Name = message.From.Name,
                Email = message.From.Email
            },
            To = message.To.Select(c => new BrevoEmailContact
            {
                Name = c.Name,
                Email = c.Email
            }).ToList(),
            Subject = message.Subject,
            TextContent = message.TextContent,
            HtmlContent = message.HtmlContent ?? string.Empty
        };

        if (message.Cc?.Count > 0)
        {
            request.Cc = message.Cc.Select(c => new BrevoEmailContact
            {
                Name = c.Name,
                Email = c.Email
            }).ToList();
        }

        if (message.Bcc?.Count > 0)
        {
            request.Bcc = message.Bcc.Select(c => new BrevoEmailContact
            {
                Name = c.Name,
                Email = c.Email
            }).ToList();
        }

        return request;
    }
}
