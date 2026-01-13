using System.Security.Cryptography;
using System.Text;
using Azure.Identity;
using Azure.Security.KeyVault.Certificates;
using Azure.Security.KeyVault.Keys;
using Azure.Security.KeyVault.Keys.Cryptography;
using JenusSign.Core.Entities;
using JenusSign.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography.X509Certificates;

namespace JenusSign.Infrastructure.Services.Signing;

/// <summary>
/// Azure Key Vault signing service for eIDAS-compliant digital signatures
/// Uses JCC Qualified eSeal certificate stored in Azure Key Vault Premium
/// </summary>
public class AzureKeyVaultSigningService : ISigningService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<AzureKeyVaultSigningService> _logger;
    private readonly string _keyVaultUri;
    private readonly string _certificateName;

    public AzureKeyVaultSigningService(
        IConfiguration configuration,
        ILogger<AzureKeyVaultSigningService> logger)
    {
        _configuration = configuration;
        _logger = logger;
        _keyVaultUri = configuration["AzureKeyVault:VaultUri"] 
            ?? throw new ArgumentNullException("AzureKeyVault:VaultUri configuration is required");
        _certificateName = configuration["AzureKeyVault:CertificateName"] 
            ?? "jenussign-eseal";
    }

    /// <inheritdoc/>
    public Task<string> ComputeDocumentHashAsync(byte[] documentContent, CancellationToken cancellationToken = default)
    {
        using var sha256 = SHA256.Create();
        var hashBytes = sha256.ComputeHash(documentContent);
        var hash = Convert.ToHexString(hashBytes).ToLowerInvariant();
        
        _logger.LogInformation("Computed document hash: {HashPrefix}...", hash[..16]);
        return Task.FromResult(hash);
    }

    /// <inheritdoc/>
    public async Task<SignatureResult> SignDocumentAsync(string documentHash, SigningSession session, CancellationToken cancellationToken = default)
    {
        try
        {
            var credential = new DefaultAzureCredential();
            var keyClient = new KeyClient(new Uri(_keyVaultUri), credential);
            var certificateClient = new CertificateClient(new Uri(_keyVaultUri), credential);

            // Get certificate for metadata
            var certificate = await certificateClient.GetCertificateAsync(_certificateName, cancellationToken);
            var certX509 = X509CertificateLoader.LoadCertificate(certificate.Value.Cer);
            
            // Get the key for signing
            var key = await keyClient.GetKeyAsync(_certificateName, cancellationToken: cancellationToken);
            
            // Create cryptography client
            var cryptoClient = new CryptographyClient(key.Value.Id, credential);
            
            // Convert hash to bytes
            var hashBytes = Convert.FromHexString(documentHash);
            
            // Sign the hash using RS256 (RSA with SHA-256)
            var signResult = await cryptoClient.SignAsync(
                SignatureAlgorithm.RS256, 
                hashBytes, 
                cancellationToken);
            
            var signature = Convert.ToBase64String(signResult.Signature);
            
            _logger.LogInformation(
                "Document signed successfully. Certificate: {Subject}, Serial: {Serial}",
                certX509.Subject,
                certX509.SerialNumber);

            return new SignatureResult(
                Signature: signature,
                CertificateSerialNumber: certX509.SerialNumber,
                CertificateThumbprint: certificate.Value.Properties.X509Thumbprint != null 
                    ? Convert.ToHexString(certificate.Value.Properties.X509Thumbprint)
                    : "Unknown",
                CertificateSubject: certX509.Subject,
                SignedAt: DateTime.UtcNow
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to sign document with Azure Key Vault");
            throw;
        }
    }

    /// <inheritdoc/>
    public async Task<bool> VerifySignatureAsync(string documentHash, string signature, string certificateThumbprint, CancellationToken cancellationToken = default)
    {
        try
        {
            var credential = new DefaultAzureCredential();
            var keyClient = new KeyClient(new Uri(_keyVaultUri), credential);
            
            // Get the key
            var key = await keyClient.GetKeyAsync(_certificateName, cancellationToken: cancellationToken);
            
            // Create cryptography client
            var cryptoClient = new CryptographyClient(key.Value.Id, credential);
            
            // Convert hash and signature
            var hashBytes = Convert.FromHexString(documentHash);
            var signatureBytes = Convert.FromBase64String(signature);
            
            // Verify the signature
            var verifyResult = await cryptoClient.VerifyAsync(
                SignatureAlgorithm.RS256,
                hashBytes,
                signatureBytes,
                cancellationToken);
            
            _logger.LogInformation("Signature verification result: {IsValid}", verifyResult.IsValid);
            return verifyResult.IsValid;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to verify signature");
            return false;
        }
    }

    /// <inheritdoc/>
    public async Task<CertificateInfo> GetCertificateInfoAsync(CancellationToken cancellationToken = default)
    {
        var credential = new DefaultAzureCredential();
        var certificateClient = new CertificateClient(new Uri(_keyVaultUri), credential);
        
        var certificate = await certificateClient.GetCertificateAsync(_certificateName, cancellationToken);
        var props = certificate.Value.Properties;
        var certX509 = X509CertificateLoader.LoadCertificate(certificate.Value.Cer);
        
        // Build certificate chain (simplified - in production you'd retrieve the full chain)
        var certificateChain = new[]
        {
            "JenusSign Qualified eSeal - JCC Cyprus Trust Center",
            "JCC Cyprus Trust Center - Cyprus Root CA",
            "Cyprus Root CA - European Trust Root"
        };

        return new CertificateInfo(
            Subject: certX509.Subject,
            Issuer: "JCC Cyprus Trust Center", // Would come from actual cert
            SerialNumber: certX509.SerialNumber,
            Thumbprint: props.X509Thumbprint != null 
                ? Convert.ToHexString(props.X509Thumbprint) 
                : "Unknown",
            NotBefore: props.CreatedOn?.DateTime ?? DateTime.MinValue,
            NotAfter: props.ExpiresOn?.DateTime ?? DateTime.MaxValue,
            CertificateChain: certificateChain
        );
    }
}

/// <summary>
/// Development/testing signing service that doesn't require Azure Key Vault
/// </summary>
public class LocalSigningService : ISigningService
{
    private readonly ILogger<LocalSigningService> _logger;

    public LocalSigningService(ILogger<LocalSigningService> logger)
    {
        _logger = logger;
    }

    public Task<string> ComputeDocumentHashAsync(byte[] documentContent, CancellationToken cancellationToken = default)
    {
        using var sha256 = SHA256.Create();
        var hashBytes = sha256.ComputeHash(documentContent);
        return Task.FromResult(Convert.ToHexString(hashBytes).ToLowerInvariant());
    }

    public Task<SignatureResult> SignDocumentAsync(string documentHash, SigningSession session, CancellationToken cancellationToken = default)
    {
        _logger.LogWarning("Using LOCAL signing service - NOT FOR PRODUCTION");
        
        // Generate a mock signature for development
        using var rsa = RSA.Create(2048);
        var hashBytes = Convert.FromHexString(documentHash);
        var signatureBytes = rsa.SignHash(hashBytes, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);
        
        return Task.FromResult(new SignatureResult(
            Signature: Convert.ToBase64String(signatureBytes),
            CertificateSerialNumber: "DEV-CERT-001",
            CertificateThumbprint: "AABBCCDD11223344",
            CertificateSubject: "CN=JenusSign Development eSeal",
            SignedAt: DateTime.UtcNow
        ));
    }

    public Task<bool> VerifySignatureAsync(string documentHash, string signature, string certificateThumbprint, CancellationToken cancellationToken = default)
    {
        // In development mode, always return true
        return Task.FromResult(true);
    }

    public Task<CertificateInfo> GetCertificateInfoAsync(CancellationToken cancellationToken = default)
    {
        return Task.FromResult(new CertificateInfo(
            Subject: "CN=JenusSign Development eSeal",
            Issuer: "CN=Development CA",
            SerialNumber: "DEV-CERT-001",
            Thumbprint: "AABBCCDD11223344",
            NotBefore: DateTime.UtcNow.AddYears(-1),
            NotAfter: DateTime.UtcNow.AddYears(1),
            CertificateChain: new[] 
            { 
                "JenusSign Development eSeal - Development CA",
                "Development CA - Root" 
            }
        ));
    }
}
