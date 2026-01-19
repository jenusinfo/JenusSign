using JenusSign.Infrastructure.Services.Sms;
using JenusSign.Infrastructure.Services.Sms.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Xunit;
using Xunit.Abstractions;

namespace JenusSign.Tests.Sms;

/// <summary>
/// Integration tests that send real SMS - use sparingly to avoid costs
/// </summary>
public class SmsIntegrationTests
{
    private readonly ITestOutputHelper _output;

    public SmsIntegrationTests(ITestOutputHelper output)
    {
        _output = output;
    }

    [Fact]
    public async Task BrevoSmsService_SendRealSms_ShouldSucceed()
    {
        // Arrange
        var brevoSmsOptions = new BrevoSmsOptions
        {
            BaseUrl = "https://api.brevo.com/v3",
            ApiKey = "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",
            Sender = "JenusSign",
            Type = "transactional",
            UnicodeEnabled = true,
            OrganisationPrefix = "JenusTechnologies"
        };

        var loggerFactory = LoggerFactory.Create(builder => builder.AddConsole());
        var logger = loggerFactory.CreateLogger<BrevoSmsService>();
        
        var httpClient = new HttpClient();
        var options = Options.Create(brevoSmsOptions);
        var service = new BrevoSmsService(httpClient, options, logger);

        // Act - send to test phone number
        var result = await service.SendSmsAsync(
            phoneNumber: "35799511530",
            content: "JenusSign Test: Your secure signing link is ready: https://jenussign.jenusplanet.com/",
            tag: "integration-test"
        );

        // Assert
        _output.WriteLine($"Success: {result.IsSuccess}");
        _output.WriteLine($"MessageId: {result.MessageId}");
        _output.WriteLine($"Error: {result.ErrorMessage}");
        _output.WriteLine($"StatusCode: {result.StatusCode}");

        Assert.True(result.IsSuccess, $"Failed to send SMS: {result.ErrorMessage}");
        Assert.NotNull(result.MessageId);
    }

    [Fact(Skip = "Integration test - sends real SMS")]
    // [Fact] // Uncomment to run
    public async Task BrevoSmsService_SendSigningRequest_ShouldSucceed()
    {
        // Arrange
        var brevoSmsOptions = new BrevoSmsOptions
        {
            BaseUrl = "https://api.brevo.com/v3",
            ApiKey = "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",
            Sender = "JenusSign",
            Type = "transactional",
            UnicodeEnabled = true,
            OrganisationPrefix = "JenusTechnologies"
        };

        var loggerFactory = LoggerFactory.Create(builder => builder.AddConsole());
        var logger = loggerFactory.CreateLogger<BrevoSmsService>();
        
        var httpClient = new HttpClient();
        var options = Options.Create(brevoSmsOptions);
        var service = new BrevoSmsService(httpClient, options, logger);

        // Act
        var result = await service.SendSigningRequestAsync(
            phoneNumber: "35799511530",
            accessUrl: "https://jenussign.jenusplanet.com/customer/sign/abc123"
        );

        // Assert
        _output.WriteLine($"Signing request SMS sent: {result}");
        Assert.True(result, "Failed to send signing request SMS");
    }

    [Fact(Skip = "Integration test - sends real SMS")]
    // [Fact] // Uncomment to run
    public async Task BrevoSmsService_SendOtp_ShouldSucceed()
    {
        // Arrange
        var brevoSmsOptions = new BrevoSmsOptions
        {
            BaseUrl = "https://api.brevo.com/v3",
            ApiKey = "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",
            Sender = "JenusSign",
            Type = "transactional",
            UnicodeEnabled = true,
            OrganisationPrefix = "JenusTechnologies"
        };

        var loggerFactory = LoggerFactory.Create(builder => builder.AddConsole());
        var logger = loggerFactory.CreateLogger<BrevoSmsService>();
        
        var httpClient = new HttpClient();
        var options = Options.Create(brevoSmsOptions);
        var service = new BrevoSmsService(httpClient, options, logger);

        // Act
        var result = await service.SendOtpAsync(
            phoneNumber: "35799511530",
            otpCode: "123456"
        );

        // Assert
        _output.WriteLine($"OTP SMS sent: {result}");
        Assert.True(result, "Failed to send OTP SMS");
    }

    [Fact(Skip = "Integration test - tests connection only")]
    // [Fact] // Uncomment to run
    public async Task BrevoSmsService_TestConnection_ShouldSucceed()
    {
        // Arrange
        var brevoSmsOptions = new BrevoSmsOptions
        {
            BaseUrl = "https://api.brevo.com/v3",
            ApiKey = "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",
            Sender = "JenusSign"
        };

        var loggerFactory = LoggerFactory.Create(builder => builder.AddConsole());
        var logger = loggerFactory.CreateLogger<BrevoSmsService>();
        
        var httpClient = new HttpClient();
        var options = Options.Create(brevoSmsOptions);
        var service = new BrevoSmsService(httpClient, options, logger);

        // Act
        var result = await service.TestConnectionAsync();

        // Assert
        _output.WriteLine($"Connection test result: {result}");
        Assert.True(result, "Failed to connect to Brevo SMS API");
    }
}
