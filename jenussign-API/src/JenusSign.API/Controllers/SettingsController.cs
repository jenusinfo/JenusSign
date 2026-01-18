using JenusSign.Application.DTOs;
using JenusSign.Core.Enums;
using JenusSign.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JenusSign.API.Controllers;

/// <summary>
/// System settings and configuration (Admin only)
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Authorize(Roles = "Admin")]
public class SettingsController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<SettingsController> _logger;

    public SettingsController(
        IConfiguration configuration,
        IUnitOfWork unitOfWork,
        ILogger<SettingsController> logger)
    {
        _configuration = configuration;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    /// <summary>
    /// Get system settings
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<SystemSettingsDto>> GetSettings()
    {
        // Get counts for dashboard
        var userCount = await _unitOfWork.Users.CountAsync();
        var customerCount = await _unitOfWork.Customers.CountAsync();
        var proposalCount = await _unitOfWork.Proposals.CountAsync();
        var signedCount = await _unitOfWork.Proposals.CountAsync(p => p.Status == ProposalStatus.Signed);

        return Ok(new SystemSettingsDto(
            CompanyName: _configuration["App:CompanyName"] ?? "JenusSign",
            SupportEmail: _configuration["App:SupportEmail"] ?? "support@jenussign.com",
            BaseUrl: _configuration["App:BaseUrl"] ?? "https://jenussign.jenusplanet.com",
            SigningLinkExpiryDays: int.Parse(_configuration["App:SigningLinkExpiryDays"] ?? "7"),
            OtpExpiryMinutes: int.Parse(_configuration["App:OtpExpiryMinutes"] ?? "5"),
            MaxOtpAttempts: int.Parse(_configuration["App:MaxOtpAttempts"] ?? "3"),
            EnableSmsNotifications: bool.Parse(_configuration["App:EnableSmsNotifications"] ?? "true"),
            EnableEmailNotifications: bool.Parse(_configuration["App:EnableEmailNotifications"] ?? "true"),
            DefaultCurrency: _configuration["App:DefaultCurrency"] ?? "EUR",
            TimestampAuthority: _configuration["Timestamp:Authority"] ?? "DigiCert",
            KeyVaultConfigured: !string.IsNullOrEmpty(_configuration["AzureKeyVault:VaultUri"]),
            Stats: new SystemStatsDto(
                TotalUsers: userCount,
                TotalCustomers: customerCount,
                TotalProposals: proposalCount,
                TotalSigned: signedCount
            )
        ));
    }

    /// <summary>
    /// Update system settings (partial update)
    /// Note: In production, these would be stored in a database
    /// </summary>
    [HttpPatch]
    public ActionResult<SystemSettingsDto> UpdateSettings([FromBody] UpdateSettingsRequest request)
    {
        // In a real implementation, settings would be persisted to database
        // For now, just log the attempt and return current values
        _logger.LogInformation("Settings update requested: {@Request}", request);

        return Ok(new { message = "Settings update received. Note: Dynamic settings require database storage." });
    }

    /// <summary>
    /// Get consent definitions (templates for consent checkboxes)
    /// </summary>
    [HttpGet("consent-definitions")]
    [AllowAnonymous] // Allow agents to access consent definitions
    public ActionResult<IEnumerable<ConsentDefinitionDto>> GetConsentDefinitions()
    {
        // In production, these would come from database
        var definitions = new List<ConsentDefinitionDto>
        {
            new(
                Id: Guid.Parse("00000000-0000-0000-0000-000000000001"),
                Code: "PRIVACY_POLICY",
                Title: "Privacy Policy",
                Description: "I have read and accept the Privacy Policy",
                Required: true,
                Url: "/privacy-policy",
                Category: "Legal",
                Order: 1
            ),
            new(
                Id: Guid.Parse("00000000-0000-0000-0000-000000000002"),
                Code: "TERMS_CONDITIONS",
                Title: "Terms and Conditions",
                Description: "I agree to the Terms and Conditions",
                Required: true,
                Url: "/terms",
                Category: "Legal",
                Order: 2
            ),
            new(
                Id: Guid.Parse("00000000-0000-0000-0000-000000000003"),
                Code: "DATA_PROCESSING",
                Title: "Data Processing",
                Description: "I consent to the processing of my personal data for insurance purposes",
                Required: true,
                Url: null,
                Category: "GDPR",
                Order: 3
            ),
            new(
                Id: Guid.Parse("00000000-0000-0000-0000-000000000004"),
                Code: "MARKETING",
                Title: "Marketing Communications",
                Description: "I agree to receive marketing communications about products and services",
                Required: false,
                Url: null,
                Category: "Marketing",
                Order: 4
            ),
            new(
                Id: Guid.Parse("00000000-0000-0000-0000-000000000005"),
                Code: "ELECTRONIC_SIGNATURE",
                Title: "Electronic Signature Consent",
                Description: "I understand and agree that my electronic signature is legally binding",
                Required: true,
                Url: null,
                Category: "Legal",
                Order: 5
            )
        };

        return Ok(definitions);
    }

    /// <summary>
    /// Get available proposal types
    /// </summary>
    [HttpGet("proposal-types")]
    [AllowAnonymous]
    public ActionResult<IEnumerable<EnumValueDto>> GetProposalTypes()
    {
        var types = Enum.GetValues<ProposalType>()
            .Select(t => new EnumValueDto(
                Value: (int)t,
                Name: t.ToString(),
                DisplayName: GetProposalTypeDisplayName(t)
            ));

        return Ok(types);
    }

    /// <summary>
    /// Get available user roles
    /// </summary>
    [HttpGet("user-roles")]
    public ActionResult<IEnumerable<EnumValueDto>> GetUserRoles()
    {
        var roles = Enum.GetValues<UserRole>()
            .Select(r => new EnumValueDto(
                Value: (int)r,
                Name: r.ToString(),
                DisplayName: r.ToString()
            ));

        return Ok(roles);
    }

    /// <summary>
    /// Health check with system status
    /// </summary>
    [HttpGet("health")]
    [AllowAnonymous]
    public async Task<ActionResult<HealthStatusDto>> GetHealthStatus()
    {
        var dbHealthy = true;
        try
        {
            await _unitOfWork.Users.CountAsync();
        }
        catch
        {
            dbHealthy = false;
        }

        return Ok(new HealthStatusDto(
            Status: dbHealthy ? "Healthy" : "Degraded",
            Database: dbHealthy ? "Connected" : "Disconnected",
            Timestamp: DateTime.UtcNow,
            Version: "1.0.0"
        ));
    }

    private static string GetProposalTypeDisplayName(ProposalType type) => type switch
    {
        ProposalType.Motor => "Motor Insurance",
        ProposalType.Property => "Property Insurance",
        ProposalType.Life => "Life Insurance",
        ProposalType.Health => "Health Insurance",
        ProposalType.Travel => "Travel Insurance",
        ProposalType.Marine => "Marine Insurance",
        ProposalType.Liability => "Liability Insurance",
        ProposalType.Other => "Other",
        _ => type.ToString()
    };
}
