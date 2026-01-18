using JenusSign.Core.Entities;
using JenusSign.Core.Enums;

namespace JenusSign.Core.Interfaces;

/// <summary>
/// Digital signing service interface - Azure Key Vault + JCC eSeal
/// </summary>
public interface ISigningService
{
    /// <summary>
    /// Compute SHA-256 hash of document
    /// </summary>
    Task<string> ComputeDocumentHashAsync(byte[] documentContent, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Sign a document hash with the organization's eSeal certificate
    /// </summary>
    Task<SignatureResult> SignDocumentAsync(string documentHash, SigningSession session, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Verify a digital signature
    /// </summary>
    Task<bool> VerifySignatureAsync(string documentHash, string signature, string certificateThumbprint, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Get certificate information
    /// </summary>
    Task<CertificateInfo> GetCertificateInfoAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Result of a signing operation
/// </summary>
public record SignatureResult(
    string Signature,
    string CertificateSerialNumber,
    string CertificateThumbprint,
    string CertificateSubject,
    DateTime SignedAt
);

/// <summary>
/// Certificate information
/// </summary>
public record CertificateInfo(
    string Subject,
    string Issuer,
    string SerialNumber,
    string Thumbprint,
    DateTime NotBefore,
    DateTime NotAfter,
    string[] CertificateChain
);

/// <summary>
/// RFC 3161 Timestamping service interface
/// </summary>
public interface ITimestampService
{
    /// <summary>
    /// Get a trusted timestamp for a document hash
    /// </summary>
    Task<TimestampResult> GetTimestampAsync(string documentHash, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Verify a timestamp token
    /// </summary>
    Task<bool> VerifyTimestampAsync(string timestampToken, string documentHash, CancellationToken cancellationToken = default);
}

/// <summary>
/// Result of a timestamp operation
/// </summary>
public record TimestampResult(
    string Token,
    DateTime Timestamp,
    string Authority,
    string SerialNumber
);

/// <summary>
/// OTP service interface
/// </summary>
public interface IOtpService
{
    /// <summary>
    /// Generate and send OTP
    /// </summary>
    Task<OtpResult> SendOtpAsync(SigningSession session, OtpChannel channel, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Verify OTP code
    /// </summary>
    Task<OtpVerificationResult> VerifyOtpAsync(Guid sessionId, string code, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Resend OTP
    /// </summary>
    Task<OtpResult> ResendOtpAsync(Guid sessionId, CancellationToken cancellationToken = default);
}

/// <summary>
/// Result of OTP send operation
/// </summary>
public record OtpResult(
    bool Success,
    string MaskedDestination,
    OtpChannel Channel,
    DateTime ExpiresAt,
    string? ErrorMessage = null
);

/// <summary>
/// Result of OTP verification
/// </summary>
public record OtpVerificationResult(
    bool Success,
    bool IsExpired,
    bool IsLocked,
    int AttemptsRemaining,
    string? ErrorMessage = null
);

/// <summary>
/// Email service interface
/// </summary>
public interface IEmailService
{
    Task<bool> SendSigningRequestAsync(Customer customer, string accessUrl, string? message, CancellationToken cancellationToken = default);
    Task<bool> SendOtpAsync(string email, string otpCode, CancellationToken cancellationToken = default);
    Task<bool> SendSigningCompletedAsync(Customer customer, string downloadUrl, CancellationToken cancellationToken = default);
    Task<bool> SendReminderAsync(Customer customer, string accessUrl, CancellationToken cancellationToken = default);
}

/// <summary>
/// SMS service interface
/// </summary>
public interface ISmsService
{
    Task<bool> SendSigningRequestAsync(string phoneNumber, string accessUrl, CancellationToken cancellationToken = default);
    Task<bool> SendOtpAsync(string phoneNumber, string otpCode, CancellationToken cancellationToken = default);
}

/// <summary>
/// Identity verification service interface
/// </summary>
public interface IIdentityVerificationService
{
    /// <summary>
    /// Verify identity from ID card scan
    /// </summary>
    Task<IdentityVerificationResult> VerifyFromIdCardAsync(byte[] idCardImage, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Compare selfie with ID card photo
    /// </summary>
    Task<FaceMatchResult> MatchFacesAsync(byte[] idCardImage, byte[] selfieImage, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Verify identity manually provided by customer
    /// </summary>
    Task<IdentityVerificationResult> VerifyManualAsync(string idNumber, string fullName, DateTime dateOfBirth, CancellationToken cancellationToken = default);
}

/// <summary>
/// Result of identity verification
/// </summary>
public record IdentityVerificationResult(
    bool Success,
    string? IdNumber,
    string? FullName,
    DateTime? DateOfBirth,
    string? ErrorMessage = null
);

/// <summary>
/// Result of face matching
/// </summary>
public record FaceMatchResult(
    bool Success,
    decimal MatchScore,
    bool IsMatch,
    string? ErrorMessage = null
);

/// <summary>
/// PDF generation service interface
/// </summary>
public interface IPdfService
{
    /// <summary>
    /// Generate Signature Evidence Record (Audit Trail PDF)
    /// </summary>
    Task<byte[]> GenerateAuditTrailPdfAsync(SigningSession session, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Merge proposal with audit trail into final signed document
    /// </summary>
    Task<byte[]> MergeDocumentsAsync(byte[] proposalPdf, byte[] auditTrailPdf, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Apply digital seal to PDF
    /// </summary>
    Task<byte[]> ApplyDigitalSealAsync(byte[] pdfContent, SignatureResult signature, TimestampResult timestamp, CancellationToken cancellationToken = default);
}

/// <summary>
/// Document storage service interface
/// </summary>
public interface IDocumentStorageService
{
    Task<string> SaveDocumentAsync(byte[] content, string fileName, string folder, CancellationToken cancellationToken = default);
    Task<byte[]> GetDocumentAsync(string path, CancellationToken cancellationToken = default);
    Task<bool> DeleteDocumentAsync(string path, CancellationToken cancellationToken = default);
    Task<string> GetTemporaryUrlAsync(string path, TimeSpan expiry, CancellationToken cancellationToken = default);
}

/// <summary>
/// Token service for JWT management
/// </summary>
public interface ITokenService
{
    // User (Agent/Broker/Admin) token methods
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    Task<(string AccessToken, string RefreshToken)> RefreshTokensAsync(string refreshToken, CancellationToken cancellationToken = default);
    bool ValidateToken(string token);
    
    // Customer token methods
    string GenerateCustomerAccessToken(Customer customer);
    Task<(string AccessToken, string RefreshToken)> RefreshCustomerTokensAsync(string refreshToken, CancellationToken cancellationToken = default);
}
