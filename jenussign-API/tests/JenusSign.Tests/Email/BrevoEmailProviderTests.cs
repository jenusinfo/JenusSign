using System.Net;
using System.Text.Json;
using JenusSign.Infrastructure.Services.Email.Models;
using JenusSign.Infrastructure.Services.Email.Providers;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Moq.Protected;
using Xunit;

namespace JenusSign.Tests.Email;

public class BrevoEmailProviderTests
{
    private readonly Mock<ILogger<BrevoEmailProvider>> _loggerMock;
    private readonly BrevoOptions _brevoOptions;

    public BrevoEmailProviderTests()
    {
        _loggerMock = new Mock<ILogger<BrevoEmailProvider>>();
        _brevoOptions = new BrevoOptions
        {
            BaseUrl = "https://api.brevo.com/v3",
            ApiKey = "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"
        };
    }

    private HttpClient CreateMockHttpClient(HttpStatusCode statusCode, object? responseContent = null)
    {
        var handlerMock = new Mock<HttpMessageHandler>();
        
        var responseJson = responseContent != null 
            ? JsonSerializer.Serialize(responseContent, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase })
            : "{}";

        handlerMock
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage
            {
                StatusCode = statusCode,
                Content = new StringContent(responseJson)
            });

        return new HttpClient(handlerMock.Object);
    }

    [Fact]
    public void ProviderType_ShouldBeBrevo()
    {
        // Arrange
        var httpClient = CreateMockHttpClient(HttpStatusCode.OK);
        var options = Options.Create(_brevoOptions);
        var provider = new BrevoEmailProvider(httpClient, options, _loggerMock.Object);

        // Act & Assert
        Assert.Equal(EmailProviderType.Brevo, provider.ProviderType);
    }

    [Fact]
    public async Task SendAsync_WithSuccessResponse_ShouldReturnSuccess()
    {
        // Arrange
        var response = new TransactionalEmailResponse { MessageId = "test-message-id-123" };
        var httpClient = CreateMockHttpClient(HttpStatusCode.OK, response);
        var options = Options.Create(_brevoOptions);
        var provider = new BrevoEmailProvider(httpClient, options, _loggerMock.Object);
        
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
        var result = await provider.SendAsync(message);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal("test-message-id-123", result.MessageId);
        Assert.Equal(200, result.StatusCode);
    }

    [Fact]
    public async Task SendAsync_WithErrorResponse_ShouldReturnFailure()
    {
        // Arrange
        var errorResponse = new BrevoErrorResponse 
        { 
            Code = "invalid_parameter", 
            Message = "Invalid email address" 
        };
        var httpClient = CreateMockHttpClient(HttpStatusCode.BadRequest, errorResponse);
        var options = Options.Create(_brevoOptions);
        var provider = new BrevoEmailProvider(httpClient, options, _loggerMock.Object);
        
        var message = new EmailMessage
        {
            From = new EmailContact { Name = "Sender", Email = "invalid-email" },
            To = new List<EmailContact> 
            { 
                new EmailContact { Name = "Recipient", Email = "recipient@test.com" } 
            },
            Subject = "Test Subject",
            HtmlContent = "<p>Test content</p>"
        };

        // Act
        var result = await provider.SendAsync(message);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Equal("Invalid email address", result.ErrorMessage);
        Assert.Equal(400, result.StatusCode);
    }

    [Fact]
    public async Task SendAsync_WithUnauthorizedResponse_ShouldReturnFailure()
    {
        // Arrange
        var errorResponse = new BrevoErrorResponse 
        { 
            Code = "unauthorized", 
            Message = "Invalid API key" 
        };
        var httpClient = CreateMockHttpClient(HttpStatusCode.Unauthorized, errorResponse);
        var options = Options.Create(_brevoOptions);
        var provider = new BrevoEmailProvider(httpClient, options, _loggerMock.Object);
        
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

        // Act
        var result = await provider.SendAsync(message);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Equal(401, result.StatusCode);
    }

    [Fact]
    public async Task SendAsync_WithMultipleRecipients_ShouldSucceed()
    {
        // Arrange
        var response = new TransactionalEmailResponse { MessageId = "test-message-id" };
        var httpClient = CreateMockHttpClient(HttpStatusCode.OK, response);
        var options = Options.Create(_brevoOptions);
        var provider = new BrevoEmailProvider(httpClient, options, _loggerMock.Object);
        
        var message = new EmailMessage
        {
            From = new EmailContact { Name = "Sender", Email = "sender@test.com" },
            To = new List<EmailContact> 
            { 
                new EmailContact { Name = "Recipient 1", Email = "recipient1@test.com" },
                new EmailContact { Name = "Recipient 2", Email = "recipient2@test.com" }
            },
            Cc = new List<EmailContact>
            {
                new EmailContact { Name = "CC User", Email = "cc@test.com" }
            },
            Bcc = new List<EmailContact>
            {
                new EmailContact { Name = "BCC User", Email = "bcc@test.com" }
            },
            Subject = "Test Subject",
            HtmlContent = "<p>Test content</p>"
        };

        // Act
        var result = await provider.SendAsync(message);

        // Assert
        Assert.True(result.IsSuccess);
    }

    [Fact]
    public async Task TestConnectionAsync_WithValidApiKey_ShouldReturnTrue()
    {
        // Arrange
        var httpClient = CreateMockHttpClient(HttpStatusCode.OK);
        var options = Options.Create(_brevoOptions);
        var provider = new BrevoEmailProvider(httpClient, options, _loggerMock.Object);

        // Act
        var result = await provider.TestConnectionAsync();

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task TestConnectionAsync_WithInvalidApiKey_ShouldReturnFalse()
    {
        // Arrange
        var httpClient = CreateMockHttpClient(HttpStatusCode.Unauthorized);
        var options = Options.Create(_brevoOptions);
        var provider = new BrevoEmailProvider(httpClient, options, _loggerMock.Object);

        // Act
        var result = await provider.TestConnectionAsync();

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task SendAsync_WithCancellation_ShouldHandleGracefully()
    {
        // Arrange
        var handlerMock = new Mock<HttpMessageHandler>();
        handlerMock
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ThrowsAsync(new TaskCanceledException());

        var httpClient = new HttpClient(handlerMock.Object);
        var options = Options.Create(_brevoOptions);
        var provider = new BrevoEmailProvider(httpClient, options, _loggerMock.Object);
        
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

        // Act
        var result = await provider.SendAsync(message, cts.Token);

        // Assert
        Assert.False(result.IsSuccess);
    }

    [Fact]
    public void Constructor_ShouldConfigureHttpClientCorrectly()
    {
        // Arrange
        var httpClient = new HttpClient();
        var options = Options.Create(_brevoOptions);

        // Act
        var provider = new BrevoEmailProvider(httpClient, options, _loggerMock.Object);

        // Assert
        Assert.NotNull(provider);
        Assert.Equal(EmailProviderType.Brevo, provider.ProviderType);
        Assert.Equal(new Uri("https://api.brevo.com/v3/"), httpClient.BaseAddress);
        Assert.Contains(httpClient.DefaultRequestHeaders, h => h.Key == "api-key");
    }
}
