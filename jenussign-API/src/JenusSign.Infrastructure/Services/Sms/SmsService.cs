using JenusSign.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

namespace JenusSign.Infrastructure.Services.Sms;

/// <summary>
/// SMS service implementation using Twilio
/// </summary>
public class TwilioSmsService : ISmsService
{
    private readonly ILogger<TwilioSmsService> _logger;
    private readonly string _fromNumber;
    private readonly bool _isEnabled;

    public TwilioSmsService(IConfiguration configuration, ILogger<TwilioSmsService> logger)
    {
        _logger = logger;
        
        var accountSid = configuration["Twilio:AccountSid"];
        var authToken = configuration["Twilio:AuthToken"];
        _fromNumber = configuration["Twilio:FromNumber"] ?? "";
        
        _isEnabled = !string.IsNullOrEmpty(accountSid) && !string.IsNullOrEmpty(authToken);
        
        if (_isEnabled)
        {
            TwilioClient.Init(accountSid, authToken);
        }
    }

    public async Task<bool> SendSigningRequestAsync(string phoneNumber, string accessUrl, CancellationToken cancellationToken = default)
    {
        if (!_isEnabled)
        {
            _logger.LogWarning("SMS service is not configured. Skipping SMS to {Phone}", phoneNumber);
            return true; // Return true so workflow continues
        }

        try
        {
            var message = await MessageResource.CreateAsync(
                body: $"JenusSign: You have a document to sign. Click here to review and sign: {accessUrl}",
                from: new PhoneNumber(_fromNumber),
                to: new PhoneNumber(phoneNumber)
            );
            
            _logger.LogInformation("SMS sent successfully to {Phone}. SID: {Sid}", phoneNumber, message.Sid);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send SMS to {Phone}", phoneNumber);
            return false;
        }
    }

    public async Task<bool> SendOtpAsync(string phoneNumber, string otpCode, CancellationToken cancellationToken = default)
    {
        if (!_isEnabled)
        {
            _logger.LogWarning("SMS service is not configured. Skipping OTP SMS to {Phone}", phoneNumber);
            return true;
        }

        try
        {
            var message = await MessageResource.CreateAsync(
                body: $"JenusSign: Your verification code is {otpCode}. This code expires in 5 minutes. Do not share this code.",
                from: new PhoneNumber(_fromNumber),
                to: new PhoneNumber(phoneNumber)
            );
            
            _logger.LogInformation("OTP SMS sent successfully to {Phone}. SID: {Sid}", phoneNumber, message.Sid);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send OTP SMS to {Phone}", phoneNumber);
            return false;
        }
    }
}

/// <summary>
/// Mock SMS service for development/testing
/// </summary>
public class MockSmsService : ISmsService
{
    private readonly ILogger<MockSmsService> _logger;

    public MockSmsService(ILogger<MockSmsService> logger)
    {
        _logger = logger;
    }

    public Task<bool> SendSigningRequestAsync(string phoneNumber, string accessUrl, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("[MOCK SMS] Signing request to {Phone}: {Url}", phoneNumber, accessUrl);
        return Task.FromResult(true);
    }

    public Task<bool> SendOtpAsync(string phoneNumber, string otpCode, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("[MOCK SMS] OTP to {Phone}: {Code}", phoneNumber, otpCode);
        return Task.FromResult(true);
    }
}
