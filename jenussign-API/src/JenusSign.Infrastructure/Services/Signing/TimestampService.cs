using System.Net.Http.Headers;
using System.Security.Cryptography;
using JenusSign.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Org.BouncyCastle.Tsp;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Asn1;

namespace JenusSign.Infrastructure.Services.Signing;

/// <summary>
/// RFC 3161 Timestamp service implementation
/// Uses FreeTSA.org or configurable TSA endpoint
/// </summary>
public class TimestampService : ITimestampService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<TimestampService> _logger;
    private readonly string _tsaUrl;

    public TimestampService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<TimestampService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _tsaUrl = configuration["Timestamp:TsaUrl"] ?? "https://freetsa.org/tsr";
    }

    /// <inheritdoc/>
    public async Task<TimestampResult> GetTimestampAsync(string documentHash, CancellationToken cancellationToken = default)
    {
        try
        {
            // Convert hex hash to bytes
            var hashBytes = Convert.FromHexString(documentHash);
            
            // Create timestamp request
            var tsqGenerator = new TimeStampRequestGenerator();
            tsqGenerator.SetCertReq(true);
            
            // Generate nonce for uniqueness
            var nonce = new BigInteger(64, new Random());
            
            // Create the timestamp request
            var tsRequest = tsqGenerator.Generate(
                TspAlgorithms.Sha256,
                hashBytes,
                nonce);
            
            var requestBytes = tsRequest.GetEncoded();
            
            // Send request to TSA
            using var content = new ByteArrayContent(requestBytes);
            content.Headers.ContentType = new MediaTypeHeaderValue("application/timestamp-query");
            
            var response = await _httpClient.PostAsync(_tsaUrl, content, cancellationToken);
            response.EnsureSuccessStatusCode();
            
            var responseBytes = await response.Content.ReadAsByteArrayAsync(cancellationToken);
            
            // Parse timestamp response
            var tsResponse = new TimeStampResponse(responseBytes);
            
            // Validate the response
            tsResponse.Validate(tsRequest);
            
            var token = tsResponse.TimeStampToken;
            var timestamp = token.TimeStampInfo.GenTime;
            var serialNumber = token.TimeStampInfo.SerialNumber?.ToString() ?? "Unknown";
            
            _logger.LogInformation(
                "Timestamp obtained successfully from {Authority} at {Timestamp}",
                _tsaUrl, timestamp);

            return new TimestampResult(
                Token: Convert.ToBase64String(responseBytes),
                Timestamp: timestamp,
                Authority: _tsaUrl,
                SerialNumber: serialNumber
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to obtain timestamp from {TsaUrl}", _tsaUrl);
            throw;
        }
    }

    /// <inheritdoc/>
    public async Task<bool> VerifyTimestampAsync(string timestampToken, string documentHash, CancellationToken cancellationToken = default)
    {
        try
        {
            // No async calls yet; keep signature awaitable for future TSA checks
            await Task.CompletedTask;

            var tokenBytes = Convert.FromBase64String(timestampToken);
            var hashBytes = Convert.FromHexString(documentHash);
            
            // Parse the timestamp response
            var tsResponse = new TimeStampResponse(tokenBytes);
            var token = tsResponse.TimeStampToken;
            
            // Verify the hash matches
            var messageImprintDigest = token.TimeStampInfo.GetMessageImprintDigest();
            
            if (!messageImprintDigest.SequenceEqual(hashBytes))
            {
                _logger.LogWarning("Timestamp hash mismatch");
                return false;
            }
            
            // Additional validation would include certificate chain verification
            // For now, we trust the TSA response structure
            
            _logger.LogInformation("Timestamp verified successfully");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to verify timestamp");
            return false;
        }
    }
}

/// <summary>
/// Local timestamp service for development/testing
/// </summary>
public class LocalTimestampService : ITimestampService
{
    private readonly ILogger<LocalTimestampService> _logger;

    public LocalTimestampService(ILogger<LocalTimestampService> logger)
    {
        _logger = logger;
    }

    public Task<TimestampResult> GetTimestampAsync(string documentHash, CancellationToken cancellationToken = default)
    {
        _logger.LogWarning("Using LOCAL timestamp service - NOT FOR PRODUCTION");
        
        // Generate a mock timestamp token
        var mockToken = new
        {
            Hash = documentHash,
            Timestamp = DateTime.UtcNow,
            Authority = "LOCAL-TSA",
            Serial = Guid.NewGuid().ToString("N")[..16]
        };
        
        var tokenJson = System.Text.Json.JsonSerializer.Serialize(mockToken);
        var tokenBase64 = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(tokenJson));
        
        return Task.FromResult(new TimestampResult(
            Token: tokenBase64,
            Timestamp: DateTime.UtcNow,
            Authority: "LocalDevelopmentTSA",
            SerialNumber: mockToken.Serial
        ));
    }

    public Task<bool> VerifyTimestampAsync(string timestampToken, string documentHash, CancellationToken cancellationToken = default)
    {
        // In development mode, always return true
        return Task.FromResult(true);
    }
}
