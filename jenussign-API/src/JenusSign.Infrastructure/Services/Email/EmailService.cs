using JenusSign.Core.Entities;
using JenusSign.Core.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;

namespace JenusSign.Infrastructure.Services.Email;

/// <summary>
/// Email service implementation using MailKit
/// </summary>
public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;
    private readonly string _smtpHost;
    private readonly int _smtpPort;
    private readonly string _smtpUsername;
    private readonly string _smtpPassword;
    private readonly string _fromEmail;
    private readonly string _fromName;
    private readonly string _baseUrl;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
        
        _smtpHost = configuration["Email:SmtpHost"] ?? "smtp.office365.com";
        _smtpPort = configuration.GetValue<int>("Email:SmtpPort", 587);
        _smtpUsername = configuration["Email:Username"] ?? "";
        _smtpPassword = configuration["Email:Password"] ?? "";
        _fromEmail = configuration["Email:FromEmail"] ?? "noreply@jenussign.com";
        _fromName = configuration["Email:FromName"] ?? "JenusSign";
        _baseUrl = configuration["App:BaseUrl"] ?? "https://jenussign.jenusplanet.com";
    }

    public async Task<bool> SendSigningRequestAsync(Customer customer, string accessUrl, string? message, CancellationToken cancellationToken = default)
    {
        try
        {
            var subject = "Document Signing Request - Action Required";
            var body = BuildSigningRequestEmail(customer.DisplayName, accessUrl, message);
            
            return await SendEmailAsync(customer.Email, subject, body, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send signing request email to {Email}", customer.Email);
            return false;
        }
    }

    public async Task<bool> SendOtpAsync(string email, string otpCode, CancellationToken cancellationToken = default)
    {
        try
        {
            var subject = "Your Verification Code - JenusSign";
            var body = BuildOtpEmail(otpCode);
            
            return await SendEmailAsync(email, subject, body, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send OTP email to {Email}", email);
            return false;
        }
    }

    public async Task<bool> SendSigningCompletedAsync(Customer customer, string downloadUrl, CancellationToken cancellationToken = default)
    {
        try
        {
            var subject = "Document Signed Successfully - JenusSign";
            var body = BuildSigningCompletedEmail(customer.DisplayName, downloadUrl);
            
            return await SendEmailAsync(customer.Email, subject, body, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send signing completed email to {Email}", customer.Email);
            return false;
        }
    }

    public async Task<bool> SendReminderAsync(Customer customer, string accessUrl, CancellationToken cancellationToken = default)
    {
        try
        {
            var subject = "Reminder: Document Awaiting Your Signature - JenusSign";
            var body = BuildReminderEmail(customer.DisplayName, accessUrl);
            
            return await SendEmailAsync(customer.Email, subject, body, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send reminder email to {Email}", customer.Email);
            return false;
        }
    }

    private async Task<bool> SendEmailAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken)
    {
        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_fromName, _fromEmail));
            message.To.Add(new MailboxAddress(string.Empty, toEmail));
            message.Subject = subject;
            
            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = htmlBody,
                TextBody = HtmlToPlainText(htmlBody)
            };
            
            message.Body = bodyBuilder.ToMessageBody();
            
            using var client = new SmtpClient();
            await client.ConnectAsync(_smtpHost, _smtpPort, SecureSocketOptions.StartTls, cancellationToken);
            
            if (!string.IsNullOrEmpty(_smtpUsername))
            {
                await client.AuthenticateAsync(_smtpUsername, _smtpPassword, cancellationToken);
            }
            
            await client.SendAsync(message, cancellationToken);
            await client.DisconnectAsync(true, cancellationToken);
            
            _logger.LogInformation("Email sent successfully to {Email}: {Subject}", toEmail, subject);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
            return false;
        }
    }

    private string BuildSigningRequestEmail(string customerName, string accessUrl, string? customMessage)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
</head>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;'>
    <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'>
        <h1 style='color: white; margin: 0; font-size: 28px;'>JenusSign</h1>
        <p style='color: rgba(255,255,255,0.9); margin: 10px 0 0 0;'>eIDAS Compliant Digital Signing</p>
    </div>
    
    <div style='background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;'>
        <h2 style='color: #333; margin-top: 0;'>Dear {customerName},</h2>
        
        <p>You have received a document that requires your digital signature.</p>
        
        {(string.IsNullOrEmpty(customMessage) ? "" : $"<div style='background: #f5f5f5; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0;'><p style='margin: 0;'>{customMessage}</p></div>")}
        
        <p>Please click the button below to review and sign your document securely:</p>
        
        <div style='text-align: center; margin: 30px 0;'>
            <a href='{accessUrl}' style='display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;'>
                Review & Sign Document
            </a>
        </div>
        
        <p style='color: #666; font-size: 14px;'>This link will expire in 7 days. If you have any questions, please contact your insurance agent.</p>
        
        <hr style='border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;'>
        
        <p style='color: #999; font-size: 12px; margin-bottom: 0;'>
            This is an automated message from JenusSign. Your signature will be legally binding under EU eIDAS Regulation.
        </p>
    </div>
    
    <div style='background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;'>
        <p style='color: #666; font-size: 12px; margin: 0;'>© 2025 JenusSign by Jenus Insurance Ltd. All rights reserved.</p>
    </div>
</body>
</html>";
    }

    private string BuildOtpEmail(string otpCode)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
</head>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;'>
    <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'>
        <h1 style='color: white; margin: 0; font-size: 28px;'>JenusSign</h1>
        <p style='color: rgba(255,255,255,0.9); margin: 10px 0 0 0;'>Verification Code</p>
    </div>
    
    <div style='background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; text-align: center;'>
        <h2 style='color: #333; margin-top: 0;'>Your Verification Code</h2>
        
        <p>Please use the following code to complete your document signing:</p>
        
        <div style='background: #f5f5f5; padding: 20px; margin: 30px 0; border-radius: 10px;'>
            <span style='font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #667eea;'>{otpCode}</span>
        </div>
        
        <p style='color: #e74c3c; font-weight: bold;'>This code expires in 5 minutes.</p>
        
        <p style='color: #666; font-size: 14px;'>If you did not request this code, please ignore this email.</p>
        
        <hr style='border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;'>
        
        <p style='color: #999; font-size: 12px; margin-bottom: 0;'>
            Do not share this code with anyone. JenusSign will never ask for your code via phone or email.
        </p>
    </div>
    
    <div style='background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;'>
        <p style='color: #666; font-size: 12px; margin: 0;'>© 2025 JenusSign by Jenus Insurance Ltd. All rights reserved.</p>
    </div>
</body>
</html>";
    }

    private string BuildSigningCompletedEmail(string customerName, string downloadUrl)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
</head>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;'>
    <div style='background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'>
        <h1 style='color: white; margin: 0; font-size: 28px;'>✓ Document Signed</h1>
        <p style='color: rgba(255,255,255,0.9); margin: 10px 0 0 0;'>JenusSign</p>
    </div>
    
    <div style='background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;'>
        <h2 style='color: #333; margin-top: 0;'>Dear {customerName},</h2>
        
        <p>Your document has been successfully signed with an Advanced Electronic Signature (AES) compliant with EU eIDAS Regulation.</p>
        
        <div style='text-align: center; margin: 30px 0;'>
            <a href='{downloadUrl}' style='display: inline-block; background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;'>
                Download Signed Document
            </a>
        </div>
        
        <p style='color: #666; font-size: 14px;'>The signed document includes a Signature Evidence Record with full audit trail for legal verification.</p>
        
        <hr style='border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;'>
        
        <p style='color: #999; font-size: 12px; margin-bottom: 0;'>
            Please keep a copy of this document for your records. The digital signature is legally equivalent to a handwritten signature.
        </p>
    </div>
    
    <div style='background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;'>
        <p style='color: #666; font-size: 12px; margin: 0;'>© 2025 JenusSign by Jenus Insurance Ltd. All rights reserved.</p>
    </div>
</body>
</html>";
    }

    private string BuildReminderEmail(string customerName, string accessUrl)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
</head>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;'>
    <div style='background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'>
        <h1 style='color: white; margin: 0; font-size: 28px;'>⏰ Reminder</h1>
        <p style='color: rgba(255,255,255,0.9); margin: 10px 0 0 0;'>JenusSign</p>
    </div>
    
    <div style='background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;'>
        <h2 style='color: #333; margin-top: 0;'>Dear {customerName},</h2>
        
        <p>This is a friendly reminder that you have a document awaiting your signature.</p>
        
        <div style='text-align: center; margin: 30px 0;'>
            <a href='{accessUrl}' style='display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;'>
                Review & Sign Now
            </a>
        </div>
        
        <p style='color: #e74c3c; font-weight: bold;'>Please complete this action soon to avoid expiration.</p>
        
        <hr style='border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;'>
        
        <p style='color: #999; font-size: 12px; margin-bottom: 0;'>
            If you have already signed this document, please disregard this email.
        </p>
    </div>
    
    <div style='background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;'>
        <p style='color: #666; font-size: 12px; margin: 0;'>© 2025 JenusSign by Jenus Insurance Ltd. All rights reserved.</p>
    </div>
</body>
</html>";
    }

    private static string HtmlToPlainText(string html)
    {
        // Simple HTML to plain text conversion
        var text = System.Text.RegularExpressions.Regex.Replace(html, "<[^>]+>", "");
        text = System.Text.RegularExpressions.Regex.Replace(text, @"\s+", " ");
        return text.Trim();
    }
}
