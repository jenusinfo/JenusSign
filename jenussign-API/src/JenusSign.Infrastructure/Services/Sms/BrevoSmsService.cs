using System.Text;
using System.Text.Json;
using JenusSign.Core.Interfaces;
using JenusSign.Infrastructure.Services.Sms.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace JenusSign.Infrastructure.Services.Sms;

/// <summary>
/// SMS service implementation using Brevo (formerly Sendinblue) API
/// </summary>
public class BrevoSmsService : ISmsService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<BrevoSmsService> _logger;
    private readonly BrevoSmsOptions _options;
    private readonly JsonSerializerOptions _jsonOptions;

    public BrevoSmsService(
        HttpClient httpClient,
        IOptions<BrevoSmsOptions> options,
        ILogger<BrevoSmsService> logger)
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

        _logger.LogDebug("BrevoSmsService configured with BaseUrl: {BaseUrl}", baseUrl);

        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
        };
    }

    public async Task<bool> SendSigningRequestAsync(string phoneNumber, string accessUrl, CancellationToken cancellationToken = default)
    {
        var content = $"JenusSign: You have a document to sign. Click here to review and sign: {accessUrl}";
        var result = await SendSmsAsync(phoneNumber, content, "signing-request", cancellationToken);
        return result.IsSuccess;
    }

    public async Task<bool> SendOtpAsync(string phoneNumber, string otpCode, CancellationToken cancellationToken = default)
    {
        var content = $"JenusSign: Your verification code is {otpCode}. This code expires in 5 minutes. Do not share this code.";
        var result = await SendSmsAsync(phoneNumber, content, "otp", cancellationToken);
        return result.IsSuccess;
    }

    /// <summary>
    /// Send SMS with custom content
    /// </summary>
    public async Task<SmsSendResult> SendSmsAsync(string phoneNumber, string content, string? tag = null, CancellationToken cancellationToken = default)
    {
        try
        {
            // Normalize phone number - remove leading + if present
            var normalizedPhone = phoneNumber.TrimStart('+');
            
            _logger.LogInformation("Sending SMS via Brevo to: {PhoneNumber}", normalizedPhone);

            var request = new BrevoSmsRequest
            {
                Sender = _options.Sender,
                Recipient = normalizedPhone,
                Content = content,
                Type = _options.Type,
                Tag = tag,
                UnicodeEnabled = _options.UnicodeEnabled,
                OrganisationPrefix = _options.OrganisationPrefix
            };

            var json = JsonSerializer.Serialize(request, _jsonOptions);
            var httpContent = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("transactionalSMS/send", httpContent, cancellationToken);
            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                var result = JsonSerializer.Deserialize<BrevoSmsResponse>(responseContent, _jsonOptions);
                var messageId = result?.MessageId.ToString();
                
                _logger.LogInformation("Brevo SMS sent successfully. MessageId: {MessageId}", messageId);
                return SmsSendResult.Success(messageId);
            }

            var error = JsonSerializer.Deserialize<BrevoSmsErrorResponse>(responseContent, _jsonOptions);
            _logger.LogWarning("Brevo failed to send SMS: {Error} (Code: {Code})", error?.Message, error?.Code);
            return SmsSendResult.Failure(
                error?.Message ?? "Unknown error from Brevo",
                (int)response.StatusCode);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "HTTP error while sending SMS via Brevo");
            return SmsSendResult.Failure($"HTTP error: {ex.Message}", 503);
        }
        catch (TaskCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            _logger.LogWarning("Brevo SMS send was cancelled");
            return SmsSendResult.Failure("Request was cancelled", 499);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception while sending SMS via Brevo");
            return SmsSendResult.Failure(ex.Message, 500);
        }
    }

    /// <summary>
    /// Test connection to Brevo SMS API
    /// </summary>
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
            _logger.LogError(ex, "Failed to test Brevo SMS connection");
            return false;
        }
    }
}
