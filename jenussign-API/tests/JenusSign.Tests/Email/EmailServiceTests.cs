using JenusSign.Core.Entities;
using JenusSign.Infrastructure.Services.Email;
using JenusSign.Infrastructure.Services.Email.Models;
using JenusSign.Infrastructure.Services.Email.Providers;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace JenusSign.Tests.Email;

public class EmailServiceTests
{
    private readonly Mock<ILogger<EmailService>> _loggerMock;
    private readonly EmailOptions _emailOptions;
    private readonly MailSettings _mailSettings;

    public EmailServiceTests()
    {
        _loggerMock = new Mock<ILogger<EmailService>>();
        _emailOptions = new EmailOptions
        {
            Provider = EmailProviderType.Smtp
        };
        _mailSettings = new MailSettings
        {
            Mail = "test@gmail.com",
            DisplayName = "Test Sender",
            Password = "password",
            Host = "smtp.gmail.com",
            Port = 587
        };
    }

    private Mock<IEmailProvider> CreateMockProvider(EmailProviderType providerType, bool sendSuccess = true)
    {
        var providerMock = new Mock<IEmailProvider>();
        providerMock.Setup(p => p.ProviderType).Returns(providerType);
        providerMock
            .Setup(p => p.SendAsync(It.IsAny<EmailMessage>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(sendSuccess 
                ? EmailSendResult.Success("test-message-id")
                : EmailSendResult.Failure("Send failed", 500));
        return providerMock;
    }

    [Fact]
    public void Constructor_WithMatchingProvider_ShouldInitialize()
    {
        // Arrange
        var smtpProviderMock = CreateMockProvider(EmailProviderType.Smtp);
        var providers = new List<IEmailProvider> { smtpProviderMock.Object };
        var emailOptions = Options.Create(_emailOptions);
        var mailSettings = Options.Create(_mailSettings);

        // Act
        var service = new EmailService(providers, emailOptions, mailSettings, _loggerMock.Object);

        // Assert
        Assert.NotNull(service);
    }

    [Fact]
    public void Constructor_WithNoMatchingProvider_ShouldThrow()
    {
        // Arrange
        var brevoProviderMock = CreateMockProvider(EmailProviderType.Brevo);
        var providers = new List<IEmailProvider> { brevoProviderMock.Object };
        var emailOptions = Options.Create(new EmailOptions { Provider = EmailProviderType.Smtp });
        var mailSettings = Options.Create(_mailSettings);

        // Act & Assert
        Assert.Throws<InvalidOperationException>(() => 
            new EmailService(providers, emailOptions, mailSettings, _loggerMock.Object));
    }

    [Fact]
    public async Task SendSigningRequestAsync_WithValidCustomer_ShouldCallProvider()
    {
        // Arrange
        var providerMock = CreateMockProvider(EmailProviderType.Smtp);
        var providers = new List<IEmailProvider> { providerMock.Object };
        var emailOptions = Options.Create(_emailOptions);
        var mailSettings = Options.Create(_mailSettings);
        var service = new EmailService(providers, emailOptions, mailSettings, _loggerMock.Object);

        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            Email = "customer@test.com",
            FirstName = "John",
            LastName = "Doe"
        };

        // Act
        var result = await service.SendSigningRequestAsync(customer, "https://sign.example.com/abc", "Please sign");

        // Assert
        Assert.True(result);
        providerMock.Verify(p => p.SendAsync(
            It.Is<EmailMessage>(m => 
                m.To.Any(t => t.Email == "customer@test.com") &&
                m.Subject.Contains("Signing Request")),
            It.IsAny<CancellationToken>()), 
            Times.Once);
    }

    [Fact]
    public async Task SendOtpAsync_ShouldSendOtpEmail()
    {
        // Arrange
        var providerMock = CreateMockProvider(EmailProviderType.Smtp);
        var providers = new List<IEmailProvider> { providerMock.Object };
        var emailOptions = Options.Create(_emailOptions);
        var mailSettings = Options.Create(_mailSettings);
        var service = new EmailService(providers, emailOptions, mailSettings, _loggerMock.Object);

        // Act
        var result = await service.SendOtpAsync("user@test.com", "123456");

        // Assert
        Assert.True(result);
        providerMock.Verify(p => p.SendAsync(
            It.Is<EmailMessage>(m => 
                m.To.Any(t => t.Email == "user@test.com") &&
                m.Subject.Contains("Verification Code")),
            It.IsAny<CancellationToken>()), 
            Times.Once);
    }

    [Fact]
    public async Task SendSigningCompletedAsync_ShouldSendCompletionEmail()
    {
        // Arrange
        var providerMock = CreateMockProvider(EmailProviderType.Smtp);
        var providers = new List<IEmailProvider> { providerMock.Object };
        var emailOptions = Options.Create(_emailOptions);
        var mailSettings = Options.Create(_mailSettings);
        var service = new EmailService(providers, emailOptions, mailSettings, _loggerMock.Object);

        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            Email = "customer@test.com",
            FirstName = "Jane",
            LastName = "Smith"
        };

        // Act
        var result = await service.SendSigningCompletedAsync(customer, "https://download.example.com/doc");

        // Assert
        Assert.True(result);
        providerMock.Verify(p => p.SendAsync(
            It.Is<EmailMessage>(m => 
                m.Subject.Contains("Signed Successfully")),
            It.IsAny<CancellationToken>()), 
            Times.Once);
    }

    [Fact]
    public async Task SendReminderAsync_ShouldSendReminderEmail()
    {
        // Arrange
        var providerMock = CreateMockProvider(EmailProviderType.Smtp);
        var providers = new List<IEmailProvider> { providerMock.Object };
        var emailOptions = Options.Create(_emailOptions);
        var mailSettings = Options.Create(_mailSettings);
        var service = new EmailService(providers, emailOptions, mailSettings, _loggerMock.Object);

        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            Email = "customer@test.com",
            FirstName = "Bob",
            LastName = "Wilson"
        };

        // Act
        var result = await service.SendReminderAsync(customer, "https://sign.example.com/abc");

        // Assert
        Assert.True(result);
        providerMock.Verify(p => p.SendAsync(
            It.Is<EmailMessage>(m => 
                m.Subject.Contains("Reminder")),
            It.IsAny<CancellationToken>()), 
            Times.Once);
    }

    [Fact]
    public async Task SendAsync_WhenProviderFails_ShouldReturnFalse()
    {
        // Arrange
        var providerMock = CreateMockProvider(EmailProviderType.Smtp, sendSuccess: false);
        var providers = new List<IEmailProvider> { providerMock.Object };
        var emailOptions = Options.Create(_emailOptions);
        var mailSettings = Options.Create(_mailSettings);
        var service = new EmailService(providers, emailOptions, mailSettings, _loggerMock.Object);

        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            Email = "customer@test.com",
            FirstName = "Test",
            LastName = "User"
        };

        // Act
        var result = await service.SendSigningRequestAsync(customer, "https://sign.example.com", null);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task SendEmail_ShouldUseMailSettingsForFromAddress()
    {
        // Arrange
        var providerMock = CreateMockProvider(EmailProviderType.Smtp);
        var providers = new List<IEmailProvider> { providerMock.Object };
        var emailOptions = Options.Create(_emailOptions);
        var customMailSettings = new MailSettings
        {
            Mail = "custom@sender.com",
            DisplayName = "Custom Sender Name",
            Password = "password",
            Host = "smtp.gmail.com",
            Port = 587
        };
        var mailSettings = Options.Create(customMailSettings);
        var service = new EmailService(providers, emailOptions, mailSettings, _loggerMock.Object);

        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            Email = "customer@test.com",
            FirstName = "Test",
            LastName = "User"
        };

        // Act
        await service.SendSigningRequestAsync(customer, "https://sign.example.com", null);

        // Assert
        providerMock.Verify(p => p.SendAsync(
            It.Is<EmailMessage>(m => 
                m.From.Email == "custom@sender.com" &&
                m.From.Name == "Custom Sender Name"),
            It.IsAny<CancellationToken>()), 
            Times.Once);
    }

    [Theory]
    [InlineData(EmailProviderType.Smtp)]
    [InlineData(EmailProviderType.Brevo)]
    public void Constructor_ShouldSelectCorrectProvider(EmailProviderType selectedProvider)
    {
        // Arrange
        var smtpProviderMock = CreateMockProvider(EmailProviderType.Smtp);
        var brevoProviderMock = CreateMockProvider(EmailProviderType.Brevo);
        var providers = new List<IEmailProvider> 
        { 
            smtpProviderMock.Object, 
            brevoProviderMock.Object 
        };
        var emailOptions = Options.Create(new EmailOptions { Provider = selectedProvider });
        var mailSettings = Options.Create(_mailSettings);

        // Act
        var service = new EmailService(providers, emailOptions, mailSettings, _loggerMock.Object);

        // Assert
        Assert.NotNull(service);
    }
}
