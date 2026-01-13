using System.Security.Cryptography;
using JenusSign.Core.Entities;
using JenusSign.Core.Enums;
using JenusSign.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace JenusSign.Infrastructure.Services;

/// <summary>
/// OTP service implementation for secure one-time password generation and verification
/// </summary>
public class OtpService : IOtpService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IEmailService _emailService;
    private readonly ISmsService _smsService;
    private readonly ILogger<OtpService> _logger;
    private readonly int _otpValidityMinutes;
    private readonly int _maxAttempts;

    public OtpService(
        IUnitOfWork unitOfWork,
        IEmailService emailService,
        ISmsService smsService,
        IConfiguration configuration,
        ILogger<OtpService> logger)
    {
        _unitOfWork = unitOfWork;
        _emailService = emailService;
        _smsService = smsService;
        _logger = logger;
        _otpValidityMinutes = configuration.GetValue<int>("Otp:ValidityMinutes", 5);
        _maxAttempts = configuration.GetValue<int>("Otp:MaxAttempts", 3);
    }

    /// <inheritdoc/>
    public async Task<OtpResult> SendOtpAsync(SigningSession session, OtpChannel channel, CancellationToken cancellationToken = default)
    {
        try
        {
            // Invalidate any existing OTPs for this session
            var existingOtps = await _unitOfWork.OtpCodes.FindAsync(
                o => o.SigningSessionId == session.Id && !o.IsVerified && !o.IsExpired,
                cancellationToken);
            
            foreach (var existing in existingOtps)
            {
                existing.ExpiresAt = DateTime.UtcNow; // Mark as expired
                await _unitOfWork.OtpCodes.UpdateAsync(existing, cancellationToken);
            }
            
            // Generate new OTP
            var code = OtpCode.Generate();
            var codeHash = HashOtp(code);
            
            var destination = channel == OtpChannel.Sms 
                ? session.Customer.Phone 
                : session.Customer.Email;
            
            var maskedDestination = channel == OtpChannel.Sms
                ? OtpCode.MaskPhone(destination)
                : OtpCode.MaskEmail(destination);
            
            var otpCode = new OtpCode
            {
                SigningSessionId = session.Id,
                Code = code, // Store temporarily for sending, will be cleared
                CodeHash = codeHash,
                Channel = channel,
                SentTo = destination,
                MaskedSentTo = maskedDestination,
                ExpiresAt = DateTime.UtcNow.AddMinutes(_otpValidityMinutes),
                MaxAttempts = _maxAttempts
            };
            
            // Send OTP
            bool sent;
            if (channel == OtpChannel.Sms)
            {
                sent = await _smsService.SendOtpAsync(destination, code, cancellationToken);
            }
            else
            {
                sent = await _emailService.SendOtpAsync(destination, code, cancellationToken);
            }
            
            if (!sent)
            {
                _logger.LogError("Failed to send OTP via {Channel} to {Destination}", channel, maskedDestination);
                return new OtpResult(
                    Success: false,
                    MaskedDestination: maskedDestination,
                    Channel: channel,
                    ExpiresAt: otpCode.ExpiresAt,
                    ErrorMessage: $"Failed to send OTP via {channel}"
                );
            }
            
            // Clear the plain text code before saving
            otpCode.Code = string.Empty;
            
            await _unitOfWork.OtpCodes.AddAsync(otpCode, cancellationToken);
            
            // Update session
            session.OtpChannel = channel;
            session.OtpSentTo = maskedDestination;
            session.OtpSentAt = DateTime.UtcNow;
            session.OtpExpiresAt = otpCode.ExpiresAt;
            session.Status = ProposalStatus.AwaitingOtp;
            
            await _unitOfWork.SigningSessions.UpdateAsync(session, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            
            _logger.LogInformation(
                "OTP sent successfully via {Channel} to {Destination} for session {SessionId}",
                channel, maskedDestination, session.Id);
            
            return new OtpResult(
                Success: true,
                MaskedDestination: maskedDestination,
                Channel: channel,
                ExpiresAt: otpCode.ExpiresAt
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending OTP for session {SessionId}", session.Id);
            throw;
        }
    }

    /// <inheritdoc/>
    public async Task<OtpVerificationResult> VerifyOtpAsync(Guid sessionId, string code, CancellationToken cancellationToken = default)
    {
        try
        {
            // Get the latest non-expired OTP for this session
            var otpCodes = await _unitOfWork.OtpCodes.FindAsync(
                o => o.SigningSessionId == sessionId,
                cancellationToken);
            
            var latestOtp = otpCodes
                .OrderByDescending(o => o.SentAt)
                .FirstOrDefault();
            
            if (latestOtp == null)
            {
                return new OtpVerificationResult(
                    Success: false,
                    IsExpired: false,
                    IsLocked: false,
                    AttemptsRemaining: 0,
                    ErrorMessage: "No OTP found for this session"
                );
            }
            
            if (latestOtp.IsExpired)
            {
                return new OtpVerificationResult(
                    Success: false,
                    IsExpired: true,
                    IsLocked: false,
                    AttemptsRemaining: 0,
                    ErrorMessage: "OTP has expired. Please request a new one."
                );
            }
            
            if (latestOtp.IsLocked)
            {
                return new OtpVerificationResult(
                    Success: false,
                    IsExpired: false,
                    IsLocked: true,
                    AttemptsRemaining: 0,
                    ErrorMessage: "Too many failed attempts. Please request a new OTP."
                );
            }
            
            // Verify the code
            var codeHash = HashOtp(code);
            if (codeHash != latestOtp.CodeHash)
            {
                latestOtp.Attempts++;
                await _unitOfWork.OtpCodes.UpdateAsync(latestOtp, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                
                var remaining = latestOtp.MaxAttempts - latestOtp.Attempts;
                
                _logger.LogWarning(
                    "Invalid OTP attempt for session {SessionId}. Attempts remaining: {Remaining}",
                    sessionId, remaining);
                
                return new OtpVerificationResult(
                    Success: false,
                    IsExpired: false,
                    IsLocked: remaining <= 0,
                    AttemptsRemaining: Math.Max(0, remaining),
                    ErrorMessage: remaining > 0 
                        ? $"Invalid OTP. {remaining} attempts remaining."
                        : "Too many failed attempts. Please request a new OTP."
                );
            }
            
            // OTP is valid
            latestOtp.IsVerified = true;
            latestOtp.VerifiedAt = DateTime.UtcNow;
            await _unitOfWork.OtpCodes.UpdateAsync(latestOtp, cancellationToken);
            
            // Update session
            var session = await _unitOfWork.SigningSessions.GetByIdAsync(sessionId, cancellationToken);
            if (session != null)
            {
                session.OtpVerified = true;
                session.OtpVerifiedAt = DateTime.UtcNow;
                await _unitOfWork.SigningSessions.UpdateAsync(session, cancellationToken);
            }
            
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            
            _logger.LogInformation("OTP verified successfully for session {SessionId}", sessionId);
            
            return new OtpVerificationResult(
                Success: true,
                IsExpired: false,
                IsLocked: false,
                AttemptsRemaining: latestOtp.MaxAttempts - latestOtp.Attempts
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying OTP for session {SessionId}", sessionId);
            throw;
        }
    }

    /// <inheritdoc/>
    public async Task<OtpResult> ResendOtpAsync(Guid sessionId, CancellationToken cancellationToken = default)
    {
        var session = await _unitOfWork.SigningSessions.GetByIdAsync(sessionId, cancellationToken);
        if (session == null)
        {
            return new OtpResult(
                Success: false,
                MaskedDestination: string.Empty,
                Channel: OtpChannel.Email,
                ExpiresAt: DateTime.UtcNow,
                ErrorMessage: "Session not found"
            );
        }
        
        // Use the same channel as before, defaulting to email
        var channel = session.OtpChannel != default ? session.OtpChannel : OtpChannel.Email;
        return await SendOtpAsync(session, channel, cancellationToken);
    }

    private static string HashOtp(string code)
    {
        using var sha256 = SHA256.Create();
        var bytes = System.Text.Encoding.UTF8.GetBytes(code);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToHexString(hash).ToLowerInvariant();
    }
}
