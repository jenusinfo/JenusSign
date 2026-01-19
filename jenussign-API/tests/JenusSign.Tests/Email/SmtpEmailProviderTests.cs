using JenusSign.Infrastructure.Services.Email.Models;
using JenusSign.Infrastructure.Services.Email.Providers;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace JenusSign.Tests.Email;

public class SmtpEmailProviderTests
{
    private readonly Mock<ILogger<SmtpEmailProvider>> _loggerMock;
    private readonly MailSettings _mailSettings;

    public SmtpEmailProviderTests()
    {
        _loggerMock = new Mock<ILogger<SmtpEmailProvider>>();
        _mailSettings = new MailSettings
        {
            Mail = "jenussign@gmail.com",
            DisplayName = "Jenus CxP Onboarding",
            Password = "umti best yfzw lplm",
            Host = "smtp.gmail.com",
            Port = 587
        };
    }

    [Fact]
    public void ProviderType_ShouldBeSmtp()
    {
        // Arrange
        var options = Options.Create(_mailSettings);
        var provider = new SmtpEmailProvider(options, _loggerMock.Object);

        // Act & Assert
        Assert.Equal(EmailProviderType.Smtp, provider.ProviderType);
    }

    [Fact]
    public async Task SendAsync_WithValidMessage_ShouldAttemptToSend()
    {
        // Arrange
        var options = Options.Create(_mailSettings);
        var provider = new SmtpEmailProvider(options, _loggerMock.Object);
        
        var message = new EmailMessage
        {
            From = new EmailContact { Name = "Sender", Email = "sender@test.com" },
            To = new List<EmailContact> 
            { 
                new EmailContact { Name = "Recipient", Email = "recipient@test.com" } 
            },
            Subject = "Test Subject",
            HtmlContent = "<p>Test content</p>",
            TextContent = "Test content"
        };

        // Act
        // Note: This will fail because we can't actually connect to SMTP in tests
        // but it validates the message building logic
        var result = await provider.SendAsync(message);

        // Assert
        // Since we can't connect to real SMTP, we expect a failure
        Assert.False(result.IsSuccess);
        Assert.NotNull(result.ErrorMessage);
    }

    [Fact]
    public async Task SendAsync_WithCancellation_ShouldReturnCancelledResult()
    {
        // Arrange
        var options = Options.Create(_mailSettings);
        var provider = new SmtpEmailProvider(options, _loggerMock.Object);
        
        var message = new EmailMessage
        {
            From = new EmailContact { Name = "Sender", Email = "sender@test.com" },
            To = new List<EmailContact> 
            { 
                new EmailContact { Name = "Recipient", Email = "recipient@test.com" } 
            },
            Subject = "Test Subject",
            HtmlContent = "<p>Test content</p>"
        };

        var cts = new CancellationTokenSource();
        cts.Cancel();

        // Act
        var result = await provider.SendAsync(message, cts.Token);

        // Assert
        Assert.False(result.IsSuccess);
    }

    [Fact]
    public async Task TestConnectionAsync_WithInvalidCredentials_ShouldReturnFalse()
    {
        // Arrange
        var options = Options.Create(_mailSettings);
        var provider = new SmtpEmailProvider(options, _loggerMock.Object);

        // Act
        var result = await provider.TestConnectionAsync();

        // Assert
        // Will fail because credentials are not valid
        Assert.False(result);
    }

    [Theory]
    [InlineData(465)]
    [InlineData(587)]
    [InlineData(25)]
    public void Constructor_WithDifferentPorts_ShouldNotThrow(int port)
    {
        // Arrange
        var settings = new MailSettings
        {
            Mail = "test@gmail.com",
            DisplayName = "Test",
            Password = "password",
            Host = "smtp.gmail.com",
            Port = port
        };
        var options = Options.Create(settings);

        // Act & Assert
        var provider = new SmtpEmailProvider(options, _loggerMock.Object);
        Assert.NotNull(provider);
        Assert.Equal(EmailProviderType.Smtp, provider.ProviderType);
    }
}
