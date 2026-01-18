namespace JenusSign.Core.Enums;

/// <summary>
/// User roles in the system matching frontend hierarchy
/// </summary>
public enum UserRole
{
    /// <summary>
    /// Full system access including settings
    /// </summary>
    Admin = 1,
    
    /// <summary>
    /// Can see all data but no admin settings
    /// </summary>
    Employee = 2,
    
    /// <summary>
    /// Can see all data under their agents
    /// </summary>
    Broker = 3,
    
    /// <summary>
    /// Can see only their own customers and proposals
    /// </summary>
    Agent = 4
}

/// <summary>
/// Proposal status in the signing workflow
/// </summary>
public enum ProposalStatus
{
    /// <summary>
    /// Initial draft state
    /// </summary>
    Draft = 1,
    
    /// <summary>
    /// Sent to customer for review
    /// </summary>
    PendingReview = 2,
    
    /// <summary>
    /// Customer has viewed the document
    /// </summary>
    Viewed = 3,
    
    /// <summary>
    /// Customer is reviewing the document
    /// </summary>
    UnderReview = 4,
    
    /// <summary>
    /// Awaiting customer signature
    /// </summary>
    PendingSignature = 5,
    
    /// <summary>
    /// OTP sent, awaiting verification
    /// </summary>
    AwaitingOtp = 6,
    
    /// <summary>
    /// Successfully signed
    /// </summary>
    Signed = 7,
    
    /// <summary>
    /// Rejected by customer
    /// </summary>
    Rejected = 8,
    
    /// <summary>
    /// Proposal expired without action
    /// </summary>
    Expired = 9,
    
    /// <summary>
    /// Cancelled by agent/broker
    /// </summary>
    Cancelled = 10
}

/// <summary>
/// Type of insurance proposal
/// </summary>
public enum ProposalType
{
    Motor = 1,
    Home = 2,
    Property = 3,
    Life = 4,
    Health = 5,
    Travel = 6,
    Marine = 7,
    Liability = 8,
    Business = 9,
    Other = 99
}

/// <summary>
/// Customer type
/// </summary>
public enum CustomerType
{
    Individual = 1,
    Corporate = 2
}

/// <summary>
/// Signature type per eIDAS classification
/// </summary>
public enum SignatureType
{
    /// <summary>
    /// Simple Electronic Signature - basic checkbox consent
    /// </summary>
    SES = 1,
    
    /// <summary>
    /// Advanced Electronic Signature - eIDAS Article 26 compliant
    /// </summary>
    AES = 2,
    
    /// <summary>
    /// Qualified Electronic Signature - JCC Trust Center integration
    /// </summary>
    QES = 3
}

/// <summary>
/// Identity verification method
/// </summary>
public enum VerificationMethod
{
    /// <summary>
    /// Manual data entry only
    /// </summary>
    ManualEntry = 1,
    
    /// <summary>
    /// ID card scan
    /// </summary>
    IdCardScan = 2,
    
    /// <summary>
    /// ID card scan with selfie
    /// </summary>
    IdCardWithSelfie = 3,
    
    /// <summary>
    /// Cyprus eID login
    /// </summary>
    CyprusEid = 4,
    
    /// <summary>
    /// OTP verification only
    /// </summary>
    OtpOnly = 5
}

/// <summary>
/// OTP delivery channel
/// </summary>
public enum OtpChannel
{
    Email = 1,
    Sms = 2,
    Both = 3
}

/// <summary>
/// Consent action type for audit trail
/// </summary>
public enum ConsentAction
{
    DocumentViewed = 1,
    DocumentScrolled = 2,
    ConsentCheckboxClicked = 3,
    SignatureDrawn = 4,
    OtpRequested = 5,
    OtpVerified = 6,
    SignatureCompleted = 7,
    DocumentRejected = 8
}

/// <summary>
/// Purpose of OTP code
/// </summary>
public enum OtpPurpose
{
    /// <summary>
    /// OTP for document signing verification
    /// </summary>
    Signing = 1,
    
    /// <summary>
    /// OTP for customer portal login
    /// </summary>
    CustomerLogin = 2,
    
    /// <summary>
    /// OTP for password reset
    /// </summary>
    PasswordReset = 3
}
