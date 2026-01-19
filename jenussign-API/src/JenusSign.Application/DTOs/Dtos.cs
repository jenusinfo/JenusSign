using JenusSign.Core.Enums;

namespace JenusSign.Application.DTOs;

// ==================== Authentication DTOs ====================

public record LoginRequest(
    string Email,
    string Password
);

public record LoginResponse(
    bool RequiresOtp,
    string? OtpToken,
    string? AccessToken,
    string? RefreshToken,
    UserDto? User
);

public record VerifyLoginOtpRequest(
    string OtpToken,
    string OtpCode
);

public record RefreshTokenRequest(
    string RefreshToken
);

public record TokenResponse(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt
);

// ==================== User DTOs ====================

public record UserDto(
    Guid Id,
    string BusinessKey,
    string Email,
    string FirstName,
    string LastName,
    string FullName,
    string? Phone,
    UserRole Role,
    bool IsActive,
    Guid? BrokerId,
    string? BrokerName,
    string? BrokerBusinessKey,
    DateTime CreatedAt,
    DateTime? LastLoginAt
);

public record CreateUserRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string? Phone,
    UserRole Role,
    Guid? BrokerId
);

public record UpdateUserRequest(
    string? FirstName,
    string? LastName,
    string? Phone,
    bool? IsActive,
    Guid? BrokerId
);

public record UserListResponse(
    IEnumerable<UserDto> Users,
    int TotalCount,
    int Page,
    int PageSize
);

// ==================== Customer DTOs ====================

public record CustomerDto(
    Guid Id,
    string BusinessKey,
    CustomerType CustomerType,
    string FirstName,
    string LastName,
    string DisplayName,
    string? CompanyName,
    string? RegistrationNumber,
    string Email,
    string Phone,
    string Address,
    string City,
    string PostalCode,
    string Country,
    string? IdNumber,
    Guid AgentId,
    string AgentName,
    string AgentBusinessKey,
    Guid? BrokerId,
    string? BrokerName,
    string? BrokerBusinessKey,
    string? NavinsCustomerId,
    DateTime CreatedAt
);

public record CreateCustomerRequest(
    CustomerType CustomerType,
    string FirstName,
    string LastName,
    string? CompanyName,
    string? RegistrationNumber,
    string? VatNumber,
    string Email,
    string Phone,
    string? AlternatePhone,
    string Address,
    string City,
    string PostalCode,
    string Country,
    string? IdNumber,
    string? IdType,
    DateTime? IdExpiryDate,
    DateTime? DateOfBirth,
    string? NavinsCustomerId
);

public record UpdateCustomerRequest(
    string? FirstName,
    string? LastName,
    string? CompanyName,
    string? Email,
    string? Phone,
    string? Address,
    string? City,
    string? PostalCode,
    string? IdNumber
);

public record CustomerListResponse(
    IEnumerable<CustomerDto> Customers,
    int TotalCount,
    int Page,
    int PageSize
);

// ==================== Proposal DTOs ====================

public record ProposalDto(
    Guid Id,
    string BusinessKey,
    string ReferenceNumber,
    string Title,
    string? Description,
    ProposalType ProposalType,
    ProposalStatus Status,
    decimal? SumInsured,
    decimal? Premium,
    decimal? Excess,
    string Currency,
    DateTime IssueDate,
    DateTime? ValidUntil,
    DateTime? PolicyStartDate,
    DateTime? PolicyEndDate,
    Guid CustomerId,
    string CustomerName,
    string CustomerBusinessKey,
    Guid AgentId,
    string AgentName,
    string AgentBusinessKey,
    Guid? BrokerId,
    string? BrokerName,
    string? BrokerBusinessKey,
    SignatureType RequiredSignatureType,
    string? NavinsProposalId,
    DateTime CreatedAt
);

public record CreateProposalRequest(
    string Title,
    string? Description,
    ProposalType ProposalType,
    decimal? SumInsured,
    decimal? Premium,
    decimal? Excess,
    string? Currency,
    DateTime? ValidUntil,
    DateTime? PolicyStartDate,
    DateTime? PolicyEndDate,
    Guid CustomerId,
    SignatureType RequiredSignatureType,
    string? NavinsProposalId
);

public record UpdateProposalRequest(
    string? Title,
    string? Description,
    ProposalStatus? Status,
    decimal? Premium,
    decimal? SumInsured,
    DateTime? ValidUntil
);

public record ProposalListResponse(
    IEnumerable<ProposalDto> Proposals,
    int TotalCount,
    int Page,
    int PageSize
);

// ==================== Signing Session DTOs ====================

public record SigningSessionDto(
    Guid Id,
    string BusinessKey,
    string AccessToken,
    string ShortCode,
    ProposalStatus Status,
    DateTime? ExpiresAt,
    Guid CustomerId,
    string CustomerName,
    Guid? ProposalId,
    string? ProposalReference,
    bool IdentityVerified,
    DateTime? IdentityVerifiedAt,
    bool OtpVerified,
    DateTime? OtpVerifiedAt,
    string? OtpSentTo,
    DateTime? SignedAt,
    string? IpAddress,
    string? DeviceInfo,
    DateTime CreatedAt
);

public record CreateSigningSessionRequest(
    Guid? ProposalId,
    Guid? EnvelopeId,
    Guid CustomerId,
    string? CustomerMessage,
    DateTime? ExpiresAt,
    bool SendEmail = true,
    bool SendSms = false
);

public record SigningSessionAccessResponse(
    Guid SessionId,
    string AccessUrl,
    string ShortCode,
    DateTime ExpiresAt
);

// ==================== Customer Portal DTOs ====================

public record CustomerSigningInfoDto(
    Guid SessionId,
    string CustomerName,
    string CustomerEmail,
    string? CustomerPhone,
    ProposalStatus Status,
    DateTime? ExpiresAt,
    IEnumerable<DocumentInfoDto> Documents,
    bool IdentityVerified,
    bool OtpVerified,
    bool CanSign,
    // Envelope/Proposal info for display
    string? Reference,
    string? Title,
    int DocumentCount,
    // Agent info
    SigningAgentInfoDto? Agent,
    // Masked customer data for verification display
    CustomerVerificationInfoDto? CustomerInfo
);

public record SigningAgentInfoDto(
    string Name,
    string? Company,
    string? Email
);

public record CustomerVerificationInfoDto(
    string FirstName,
    string LastName,
    string MaskedEmail,
    string? MaskedPhone,
    string? IdNumberLast4
);

public record DocumentInfoDto(
    Guid Id,
    string Title,
    string ReferenceNumber,
    int? Pages,
    string? DownloadUrl
);

public record VerifyIdentityRequest(
    string IdNumber,
    string FullName,
    DateTime DateOfBirth,
    VerificationMethod Method,
    string? IdCardImageBase64,
    string? SelfieImageBase64
);

public record VerifyIdentityResponse(
    bool Success,
    string? ErrorMessage,
    decimal? FaceMatchScore
);

public record RequestOtpRequest(
    OtpChannel Channel
);

public record RequestOtpResponse(
    bool Success,
    string MaskedDestination,
    OtpChannel Channel,
    DateTime ExpiresAt,
    string? ErrorMessage
);

public record VerifyOtpRequest(
    string Code
);

public record VerifyOtpResponse(
    bool Success,
    bool IsExpired,
    bool IsLocked,
    int AttemptsRemaining,
    string? ErrorMessage
);

public record CompleteSignatureRequest(
    string SignatureData,
    bool ConsentConfirmed
);

public record CompleteSignatureResponse(
    bool Success,
    string? SignedDocumentUrl,
    string? AuditTrailUrl,
    string? ErrorMessage
);

// ==================== Dashboard/Statistics DTOs ====================

public record DashboardStatsDto(
    int TotalCustomers,
    int TotalProposals,
    int PendingSignatures,
    int SignedThisMonth,
    int ExpiringSoon,
    IEnumerable<RecentActivityDto> RecentActivity
);

public record RecentActivityDto(
    string Type,
    string Description,
    DateTime Timestamp,
    string? Reference
);

// ==================== Customer Auth DTOs ====================

public record CustomerOtpRequest(
    string? Email,
    string? Phone
);

public record CustomerOtpResponse(
    bool Success,
    string MaskedDestination,
    OtpChannel Channel,
    DateTime ExpiresAt,
    string OtpToken,
    string? Message
);

public record CustomerVerifyOtpRequest(
    string OtpToken,
    string Code
);

public record CustomerLoginResponse(
    bool Success,
    string AccessToken,
    string RefreshToken,
    CustomerDto? Customer,
    DateTime ExpiresAt
);

// ==================== Customer Proposal DTOs ====================

public record CustomerProposalDto(
    Guid Id,
    string BusinessKey,
    string ReferenceNumber,
    string Title,
    string? Description,
    ProposalType ProposalType,
    ProposalStatus Status,
    decimal? Premium,
    string Currency,
    DateTime? ValidUntil,
    string AgentName,
    string? AgentPhone,
    string? AgentEmail,
    DateTime CreatedAt,
    string? SigningUrl
);

public record CustomerProposalListResponse(
    IEnumerable<CustomerProposalDto> Proposals,
    int TotalCount,
    int Page,
    int PageSize
);

public record CustomerProposalSummaryDto(
    int TotalProposals,
    int PendingSignature,
    int Signed,
    int ExpiringSoon
);

// ==================== Envelope DTOs ====================

public record EnvelopeDto(
    Guid Id,
    string BusinessKey,
    string Name,
    string? Description,
    ProposalStatus Status,
    Guid CustomerId,
    string CustomerName,
    string CustomerBusinessKey,
    Guid AgentId,
    string AgentName,
    string AgentBusinessKey,
    int DocumentCount,
    IEnumerable<DocumentInfoDto> Documents,
    DateTime? ExpiresAt,
    string? CustomerMessage,
    DateTime CreatedAt
);

public record CreateEnvelopeRequest(
    string Name,
    string? Description,
    Guid CustomerId,
    string? CustomerMessage,
    DateTime? ExpiresAt
);

public record UpdateEnvelopeRequest(
    string? Name,
    string? Description,
    string? CustomerMessage,
    DateTime? ExpiresAt
);

public record AddDocumentToEnvelopeRequest(
    Guid ProposalId
);

public record SendEnvelopeRequest(
    string? CustomerMessage,
    DateTime? ExpiresAt,
    bool SendEmail = true,
    bool SendSms = false
);

public record EnvelopeListResponse(
    IEnumerable<EnvelopeDto> Envelopes,
    int TotalCount,
    int Page,
    int PageSize
);

public record EnvelopeSigningInfoDto(
    Guid EnvelopeId,
    string BusinessKey,
    string Name,
    string? Description,
    string CustomerName,
    string CustomerEmail,
    ProposalStatus Status,
    DateTime? ExpiresAt,
    IEnumerable<DocumentInfoDto> Documents,
    string? CustomerMessage,
    bool IdentityVerified,
    bool OtpVerified,
    bool CanSign
);

// ==================== Settings DTOs ====================

public record SystemSettingsDto(
    string CompanyName,
    string SupportEmail,
    string BaseUrl,
    int SigningLinkExpiryDays,
    int OtpExpiryMinutes,
    int MaxOtpAttempts,
    bool EnableSmsNotifications,
    bool EnableEmailNotifications,
    string DefaultCurrency,
    string TimestampAuthority,
    bool KeyVaultConfigured,
    SystemStatsDto Stats
);

public record SystemStatsDto(
    int TotalUsers,
    int TotalCustomers,
    int TotalProposals,
    int TotalSigned
);

public record UpdateSettingsRequest(
    string? CompanyName,
    string? SupportEmail,
    int? SigningLinkExpiryDays,
    int? OtpExpiryMinutes,
    bool? EnableSmsNotifications,
    bool? EnableEmailNotifications
);

public record ConsentDefinitionDto(
    Guid Id,
    string Code,
    string Title,
    string Description,
    bool Required,
    string? Url,
    string Category,
    int Order
);

public record EnumValueDto(
    int Value,
    string Name,
    string DisplayName
);

public record HealthStatusDto(
    string Status,
    string Database,
    DateTime Timestamp,
    string Version
);

// ==================== System Log DTOs ====================

public record SystemLogDto(
    Guid Id,
    DateTime Timestamp,
    string EventType,
    string Severity,
    string Message,
    Guid? EnvelopeId,
    string? EnvelopeRef,
    Guid? CustomerId,
    string? CustomerName,
    Guid? UserId,
    string? UserName,
    string? IpAddress,
    string? UserAgent,
    Dictionary<string, object>? Metadata
);

public record SystemLogListResponse(
    IEnumerable<SystemLogDto> Logs,
    int TotalCount,
    int Page,
    int PageSize
);

public record SystemLogStatsResponse(
    int TotalCount,
    int InfoCount,
    int WarningCount,
    int ErrorCount,
    DateTime? FromDate,
    DateTime? ToDate
);

