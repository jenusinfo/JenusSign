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
    /// Customer is reviewing the document
    /// </summary>
    UnderReview = 3,
    
    /// <summary>
    /// Awaiting customer signature
    /// </summary>
    PendingSignature = 4,
    
    /// <summary>
    /// OTP sent, awaiting verification
    /// </summary>
    AwaitingOtp = 5,
    
    /// <summary>
    /// Successfully signed
    /// </summary>
    Signed = 6,
    
    /// <summary>
    /// Rejected by customer
    /// </summary>
    Rejected = 7,
    
    /// <summary>
    /// Proposal expired without action
    /// </summary>
    Expired = 8,
    
    /// <summary>
    /// Cancelled by agent/broker
    /// </summary>
    Cancelled = 9
}

/// <summary>
/// Type of insurance proposal
/// </summary>
public enum ProposalType
{
    Motor = 1,
    Home = 2,
    Life = 3,
    Health = 4,
    Travel = 5,
    Business = 6,
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
