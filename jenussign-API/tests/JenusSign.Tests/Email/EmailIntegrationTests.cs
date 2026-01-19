using JenusSign.Infrastructure.Services.Email.Models;
using JenusSign.Infrastructure.Services.Email.Providers;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Xunit;
using Xunit.Abstractions;

namespace JenusSign.Tests.Email;

/// <summary>
/// Integration tests that send real emails - use sparingly to avoid spam
/// These tests are skipped by default. Remove the Skip parameter to run them.
/// </summary>
public class EmailIntegrationTests
{
    private readonly ITestOutputHelper _output;

    public EmailIntegrationTests(ITestOutputHelper output)
    {
        _output = output;
    }

    [Fact]
    public async Task BrevoProvider_SendRealEmail_ShouldSucceed()
    {
        // Arrange
        var brevoOptions = new BrevoOptions
        {
            BaseUrl = "https://api.brevo.com/v3",
            ApiKey = "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"
        };

        var loggerFactory = LoggerFactory.Create(builder => builder.AddConsole());
        var logger = loggerFactory.CreateLogger<BrevoEmailProvider>();
        
        var httpClient = new HttpClient();
        var options = Options.Create(brevoOptions);
        var provider = new BrevoEmailProvider(httpClient, options, logger);

        var message = new EmailMessage
        {
            From = new EmailContact 
            { 
                Name = "Sender Alex", 
                Email = "constantinos@jenus.com.cy" 
            },
            To = new List<EmailContact>
            {
                new EmailContact 
                { 
                    Name = "John Doe", 
                    Email = "veljkovic.nenad@gmail.com" 
                }
            },
            Subject = "Test from ASP.NET Core 9.0 - Brevo Integration Test",
            HtmlContent = "<html><body><p>Hello from <strong>Brevo + ASP.NET Core!</strong></p><p>This is a test email from JenusSign integration tests.</p></body></html>",
            TextContent = "Hello from Brevo + ASP.NET Core! This is a test email from JenusSign integration tests."
        };

        // Act
        var result = await provider.SendAsync(message);

        // Assert
        _output.WriteLine($"Success: {result.IsSuccess}");
        _output.WriteLine($"MessageId: {result.MessageId}");
        _output.WriteLine($"Error: {result.ErrorMessage}");
        _output.WriteLine($"StatusCode: {result.StatusCode}");

        Assert.True(result.IsSuccess, $"Failed to send email: {result.ErrorMessage}");
        Assert.NotNull(result.MessageId);
    }

    [Fact]
    public async Task SmtpProvider_SendRealEmail_ViaGmail_ShouldSucceed()
    {
        // Arrange
        var mailSettings = new MailSettings
        {
            Mail = "jenussign@gmail.com",
            DisplayName = "Jenus CxP Onboarding",
            Password = "umti best yfzw lplm",
            Host = "smtp.gmail.com",
            Port = 587
        };

        var loggerFactory = LoggerFactory.Create(builder => builder.AddConsole());
        var logger = loggerFactory.CreateLogger<SmtpEmailProvider>();
        
        var options = Options.Create(mailSettings);
        var provider = new SmtpEmailProvider(options, logger);

        var message = new EmailMessage
        {
            From = new EmailContact 
            { 
                Name = "Jenus CxP Onboarding", 
                Email = "jenussign@gmail.com" 
            },
            To = new List<EmailContact>
            {
                new EmailContact 
                { 
                    Name = "Nenad Veljkovic", 
                    Email = "veljkovic.nenad@gmail.com" 
                }
            },
            Subject = "Test from ASP.NET Core 9.0 - Gmail SMTP Integration Test",
            HtmlContent = "<html><body><h2>JenusSign Test Email</h2><p>Hello from <strong>Gmail SMTP + ASP.NET Core!</strong></p><p>This is a test email from JenusSign integration tests.</p></body></html>",
            TextContent = "Hello from Gmail SMTP + ASP.NET Core! This is a test email from JenusSign integration tests."
        };

        // Act
        var result = await provider.SendAsync(message);

        // Assert
        _output.WriteLine($"Success: {result.IsSuccess}");
        _output.WriteLine($"MessageId: {result.MessageId}");
        _output.WriteLine($"Error: {result.ErrorMessage}");
        _output.WriteLine($"StatusCode: {result.StatusCode}");

        Assert.True(result.IsSuccess, $"Failed to send email: {result.ErrorMessage}");
    }

    [Fact]
    public async Task BrevoProvider_TestConnection_ShouldSucceed()
    {
        // Arrange
        var brevoOptions = new BrevoOptions
        {
            BaseUrl = "https://api.brevo.com/v3",
            ApiKey = "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"
        };

        var loggerFactory = LoggerFactory.Create(builder => builder.AddConsole());
        var logger = loggerFactory.CreateLogger<BrevoEmailProvider>();
        
        var httpClient = new HttpClient();
        var options = Options.Create(brevoOptions);
        var provider = new BrevoEmailProvider(httpClient, options, logger);

        // Act
        var result = await provider.TestConnectionAsync();

        // Assert
        _output.WriteLine($"Connection test result: {result}");
        Assert.True(result, "Failed to connect to Brevo API");
    }

    [Fact]
    public async Task SmtpProvider_TestConnection_ViaGmail_ShouldSucceed()
    {
        // Arrange
        var mailSettings = new MailSettings
        {
            Mail = "jenussign@gmail.com",
            DisplayName = "Jenus CxP Onboarding",
            Password = "umti best yfzw lplm",
            Host = "smtp.gmail.com",
            Port = 587
        };

        var loggerFactory = LoggerFactory.Create(builder => builder.AddConsole());
        var logger = loggerFactory.CreateLogger<SmtpEmailProvider>();
        
        var options = Options.Create(mailSettings);
        var provider = new SmtpEmailProvider(options, logger);

        // Act
        var result = await provider.TestConnectionAsync();

        // Assert
        _output.WriteLine($"Connection test result: {result}");
        Assert.True(result, "Failed to connect to Gmail SMTP");
    }
}
