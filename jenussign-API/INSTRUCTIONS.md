# JenusSign API — Development Instructions

> **eIDAS Article 26 compliant** Advanced Electronic Signature (AES) platform for the Cyprus insurance market.

---

## 📋 Overview

JenusSign is a document signing platform that enables insurance brokers/agents to send proposals to customers for legally-binding electronic signatures. The system implements all four eIDAS Article 26 requirements:

| Requirement | Implementation |
|-------------|----------------|
| Uniquely linked to signatory | Identity verification with ID number + OTP |
| Capable of identifying signatory | Captured signature image, verified identity |
| Signatory sole control | SMS/Email OTP ensures only customer can sign |
| Detects subsequent changes | SHA-256 hash + cryptographic eSeal signature |

---

## 🏗️ Solution Architecture

```
JenusSign.sln
├── src/
│   ├── JenusSign.API            # ASP.NET Core 9 Web API (controllers, middleware)
│   ├── JenusSign.Application    # DTOs, AutoMapper profiles, validation
│   ├── JenusSign.Core           # Domain entities, enums, interfaces (no dependencies)
│   └── JenusSign.Infrastructure # EF Core DbContext, repositories, external services
└── tests/
    └── JenusSign.Tests          # Integration and unit tests
```

### Layer Responsibilities

| Layer | Responsibility | Dependencies |
|-------|----------------|--------------|
| **Core** | Domain models, enums, repository interfaces | None |
| **Application** | DTOs, mapping profiles, validation | Core |
| **Infrastructure** | EF Core, repositories, signing/email/SMS services | Core |
| **API** | Controllers, auth, middleware, DI setup | All layers |

---

## 🛠️ Tech Stack

- **.NET 9.0** (C# 13, nullable enabled)
- **ASP.NET Core Identity** — User management with roles
- **Entity Framework Core 9** — SQL Server (production) / InMemory (dev)
- **JWT Bearer Authentication** — Access & refresh tokens
- **AutoMapper** — DTO mapping
- **Serilog** — Structured logging to console + file
- **Swagger/OpenAPI** — API documentation
- **Azure Key Vault** — HSM-backed eSeal certificate (production)
- **RFC 3161 Timestamps** — Trusted timestamping

---

## 🚀 Getting Started

### Prerequisites

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- SQL Server (optional — uses InMemory by default in Development)
- Visual Studio 2022+ / VS Code / Rider

### Run Locally

```powershell
cd jenussign-API/src/JenusSign.API
dotnet restore
dotnet run
```

- **API**: `https://localhost:7001`
- **Swagger UI**: `https://localhost:7001/swagger`
- **Health Check**: `https://localhost:7001/health`

### Demo Credentials

| Role | Email | Password | Scope |
|------|-------|----------|-------|
| Admin | admin@insurance.com | admin123 | Full access + user management |
| Employee | employee@insurance.com | employee123 | Read all data |
| Broker | broker@insurance.com | broker123 | See all agents' data |
| Agent | agent@insurance.com | agent123 | See own data only |

---

## 📁 Project Structure

### JenusSign.Core (Domain Layer)

```
Entities/
├── BaseEntity.cs       # Id, CreatedAt, UpdatedAt, IsDeleted (soft delete)
├── User.cs             # Extends IdentityUser<Guid>, business key, broker/agent relation
├── Customer.cs         # Insurance customer with ID number, contact info
├── Proposal.cs         # Insurance proposal linked to customer and agent
├── Envelope.cs         # Signed document with hash, signature, timestamp
├── SigningSession.cs   # Token-based signing session state
├── OtpCode.cs          # One-time password for verification
└── AuditEvent.cs       # Audit trail events for compliance

Enums/
├── UserRole.cs         # Admin, Employee, Broker, Agent
├── ProposalStatus.cs   # Draft, Sent, Viewed, Signed, Expired, Cancelled
└── SigningSessionStatus.cs

Interfaces/
├── IRepository<T>.cs   # Generic repository pattern
├── IUnitOfWork.cs      # Unit of work with all repositories
├── ISigningService.cs  # Document signing abstraction
├── ITimestampService.cs
├── IEmailService.cs
└── ISmsService.cs
```

### JenusSign.Infrastructure (Data & Services)

```
Data/
├── JenusSignDbContext.cs    # IdentityDbContext<User, IdentityRole<Guid>, Guid>
└── Configurations/          # EF Fluent API configurations

Repositories/
├── Repository<T>.cs         # Generic implementation
├── CustomerRepository.cs
├── ProposalRepository.cs
├── UserRepository.cs
└── UnitOfWork.cs

Services/
├── Signing/
│   ├── LocalSigningService.cs      # Development (self-signed)
│   └── AzureKeyVaultSigningService.cs  # Production (HSM eSeal)
├── Email/
│   ├── MockEmailService.cs
│   └── SmtpEmailService.cs
├── Sms/
│   ├── MockSmsService.cs
│   └── TwilioSmsService.cs (or local provider)
└── Pdf/
    └── AuditTrailPdfService.cs
```

### JenusSign.API (Presentation Layer)

```
Controllers/
├── AuthController.cs       # Login, refresh, logout, me
├── UsersController.cs      # User CRUD (Admin only)
├── CustomersController.cs  # Customer CRUD (role-filtered)
├── ProposalsController.cs  # Proposal CRUD (role-filtered)
└── SigningController.cs    # Public signing workflow (token-based)

Program.cs                  # DI, middleware, auth configuration
appsettings.json            # Configuration
appsettings.Development.json
```

---

## 🔐 Authentication & Authorization

### JWT Flow

1. **Login** (`POST /api/v1/auth/login`) → returns `accessToken` + `refreshToken`
2. **Use access token** in `Authorization: Bearer {token}` header
3. **Refresh** (`POST /api/v1/auth/refresh`) when access token expires
4. **Logout** (`POST /api/v1/auth/logout`) invalidates refresh token

### Role-Based Access

| Role | Customers | Proposals | Users |
|------|-----------|-----------|-------|
| **Admin** | All (CRUD) | All (CRUD) | Full CRUD |
| **Employee** | All (Read) | All (Read) | Read only |
| **Broker** | Under agents (CRUD) | Under agents (CRUD) | Read only |
| **Agent** | Own only (CRUD) | Own only (CRUD) | Read only |

### Policies Defined

```csharp
[Authorize(Roles = "Admin")]                    // Admin only
[Authorize(Roles = "Admin,Employee")]           // Admin or Employee
[Authorize(Roles = "Admin,Employee,Broker")]    // Excludes Agent
[Authorize]                                     // Any authenticated user
```

---

## 🗄️ Database

### Entity Framework Commands

```powershell
# Add migration
dotnet ef migrations add <MigrationName> `
  -p src/JenusSign.Infrastructure `
  -s src/JenusSign.API

# Apply migrations
dotnet ef database update `
  -p src/JenusSign.Infrastructure `
  -s src/JenusSign.API

# Generate SQL script
dotnet ef migrations script `
  -p src/JenusSign.Infrastructure `
  -s src/JenusSign.API `
  -o migrations.sql
```

### Business Key Formats

| Entity | Prefix | Format | Example |
|--------|--------|--------|---------|
| Admin | ADM | ADM-XXX | ADM-001 |
| Employee | EMP | EMP-XXX | EMP-001 |
| Broker | BRK | BRK-XXX | BRK-001 |
| Agent | AGT | AGT-XXX | AGT-001 |
| Customer | CUST | CUST-XXXXX | CUST-12345 |
| Proposal | PROP | PROP-XXXXX | PROP-54321 |
| Envelope | ENV | ENV-XXXXX | ENV-00001 |

### Soft Delete

All entities inherit `IsDeleted` flag. Use `.IgnoreQueryFilters()` to include deleted records.

---

## 🔄 Workflows (Step-by-Step)

### 1. Authentication Workflow

```
┌──────────────┐     POST /api/v1/auth/login     ┌──────────────┐
│   Frontend   │ ───────────────────────────────► │  AuthController│
│              │ { email, password }             │              │
└──────────────┘                                  └──────┬───────┘
                                                         │
                              ┌──────────────────────────┘
                              ▼
                    ┌─────────────────────┐
                    │ UserManager.FindBy  │
                    │ EmailAsync()        │
                    └─────────┬───────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │ SignInManager.Check │
                    │ PasswordSignInAsync │
                    └─────────┬───────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
         [Invalid]                      [Valid]
              │                               │
              ▼                               ▼
    401 Unauthorized              Generate JWT AccessToken
                                  Generate RefreshToken
                                  Save RefreshToken to User
                                  Return tokens + UserDto
```

**Step-by-Step:**

1. **Client sends** `POST /api/v1/auth/login` with `{ email, password }`
2. **AuthController** looks up user via `UserManager.FindByEmailAsync()`
3. **Validate** user exists, is active, and not soft-deleted
4. **Verify password** using `SignInManager.CheckPasswordSignInAsync()`
5. **Generate tokens:**
   - Access token (JWT, 60 min expiry) with claims: `sub`, `email`, `role`, `BrokerId`
   - Refresh token (random string, 7 day expiry)
6. **Save** refresh token to `User.RefreshToken` in database
7. **Return** `LoginResponse` with `accessToken`, `refreshToken`, `user` DTO

**Token Refresh Flow:**

```
POST /api/v1/auth/refresh
{ refreshToken: "..." }
        │
        ▼
Find user by refreshToken
        │
        ▼
Validate token not expired
        │
        ▼
Generate new accessToken + refreshToken
        │
        ▼
Update user.RefreshToken in DB
        │
        ▼
Return new tokens
```

---

### 2. Customer Management Workflow

```
┌───────────────────────────────────────────────────────────────┐
│                    Role-Based Access Control                   │
├───────────┬───────────────────────────────────────────────────┤
│   Admin   │ See ALL customers, full CRUD                      │
│  Employee │ See ALL customers, read-only                      │
│   Broker  │ See customers under all assigned agents           │
│   Agent   │ See only own customers (AgentId = current user)   │
└───────────┴───────────────────────────────────────────────────┘
```

**Create Customer Step-by-Step:**

```
POST /api/v1/customers
Authorization: Bearer {accessToken}
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "mobile": "+35799123456",
  "idNumber": "123456",
  "customerType": "Individual"
}
        │
        ▼
1. Extract user context from JWT (userId, role, brokerId)
        │
        ▼
2. Generate business key: "CUST-12345"
   └─► Count existing customers, increment
        │
        ▼
3. Set AgentId = current user's ID
        │
        ▼
4. Map DTO → Customer entity
        │
        ▼
5. Save to database via UnitOfWork
        │
        ▼
6. Return CustomerDto with business key
```

**Get Customers (Role Filtering):**

```csharp
// In CustomersController.GetCustomers():

if (role == UserRole.Agent)
    // Filter: WHERE AgentId = currentUserId
    customers = await _unitOfWork.Customers.GetByAgentIdAsync(userId);

else if (role == UserRole.Broker)
    // Filter: WHERE Agent.BrokerId = currentUserId
    customers = await _unitOfWork.Customers.GetByBrokerIdAsync(userId);

else // Admin or Employee
    // No filter - see all customers
    customers = await _unitOfWork.Customers.GetAllAsync();
```

---

### 3. Proposal Management Workflow

**Create Proposal:**

```
POST /api/v1/proposals
{
  "customerId": "guid",
  "title": "Motor Insurance Policy",
  "description": "Comprehensive coverage",
  "proposalType": "Motor",
  "premium": 450.00,
  "sumInsured": 25000.00,
  "validUntil": "2026-02-18"
}
        │
        ▼
1. Validate customer exists
        │
        ▼
2. Generate business key: "PROP-54321"
        │
        ▼
3. Generate reference number: "JNS-2026-000123"
        │
        ▼
4. Set AgentId = current user
   Set Status = Draft
        │
        ▼
5. Save proposal
        │
        ▼
6. Return ProposalDto
```

**Proposal Status Lifecycle:**

```
┌────────┐    Send for    ┌───────────────┐    Customer    ┌────────┐
│ Draft  │ ──────────────► │ PendingReview │ ──────────────► │ Viewed │
└────────┘    Signing      └───────────────┘    Opens Link   └────┬───┘
                                                                   │
    ┌──────────────────────────────────────────────────────────────┘
    │
    ▼
┌────────┐    OTP +      ┌────────────────┐
│ Signed │ ◄──────────── │ Identity + OTP │
└────────┘   Signature    │    Verified    │
                          └────────────────┘
```

---

### 4. Document Signing Workflow (Customer Portal)

This is the core eIDAS-compliant signing flow. **No authentication required** — uses secure access tokens.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SIGNING SESSION WORKFLOW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────┐                                                                │
│  │  Agent  │                                                                │
│  └────┬────┘                                                                │
│       │ POST /api/v1/proposals/{id}/send                                    │
│       │ { sendEmail: true, customerMessage: "Please sign..." }              │
│       ▼                                                                      │
│  ┌─────────────────────────────────────────┐                                │
│  │ Create SigningSession                    │                                │
│  │ ├─ AccessToken = random GUID             │                                │
│  │ ├─ ShortCode = 8-char alphanumeric       │                                │
│  │ ├─ ExpiresAt = +7 days                   │                                │
│  │ └─ Status = PendingReview                │                                │
│  └────────────────────┬────────────────────┘                                │
│                       │                                                      │
│                       ▼                                                      │
│  ┌─────────────────────────────────────────┐                                │
│  │ Send email to customer                   │                                │
│  │ Link: https://app.com/sign/{accessToken} │                                │
│  └─────────────────────────────────────────┘                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Step 1: Customer Opens Link**

```
GET /api/v1/signing/{accessToken}
        │
        ▼
1. Find session by accessToken
        │
        ▼
2. Validate session not expired (ExpiresAt > now)
        │
        ▼
3. Record audit event: "DocumentViewed"
   └─► IP address, User-Agent, Timestamp
        │
        ▼
4. Return CustomerSigningInfoDto:
   {
     sessionId, customerName, customerEmail,
     status, expiresAt, documents[],
     identityVerified: false,
     otpVerified: false,
     canSign: false
   }
```

**Step 2: Identity Verification (eIDAS Requirement 1 & 2)**

```
POST /api/v1/signing/{accessToken}/verify-identity
{
  "fullName": "John Doe",
  "idNumber": "123456",
  "method": "ID_NUMBER"
}
        │
        ▼
1. Compare provided name with Customer.DisplayName (case-insensitive)
        │
        ▼
2. Compare provided ID with Customer.IdNumber
        │
        ▼
3. If MATCH:
   ├─ session.IdentityVerified = true
   ├─ session.IdentityVerifiedAt = DateTime.UtcNow
   ├─ session.VerifiedIdNumber = request.IdNumber
   ├─ session.IpAddress = client IP
   └─ session.UserAgent = browser info
        │
        ▼
4. Record audit: "Identity verified successfully"
        │
        ▼
5. Return { success: true }
```

**Step 3: Request OTP (eIDAS Requirement 3 — Sole Control)**

```
POST /api/v1/signing/{accessToken}/request-otp
{ "channel": "sms" }  // or "email"
        │
        ▼
1. Validate identity already verified
        │
        ▼
2. Generate 6-digit OTP code
        │
        ▼
3. Store OtpCode entity:
   {
     code: "123456",
     sessionId: guid,
     expiresAt: +5 minutes,
     attempts: 0
   }
        │
        ▼
4. Send via SMS or Email service
   └─► Development: MockSmsService logs OTP to console
   └─► Production: Twilio/Real provider
        │
        ▼
5. Record audit: "OTP requested via SMS to +357****3456"
        │
        ▼
6. Return { success: true, maskedDestination: "+357****3456", expiresAt }
```

**Step 4: Verify OTP**

```
POST /api/v1/signing/{accessToken}/verify-otp
{ "code": "123456" }
        │
        ▼
1. Find active OTP for session
        │
        ▼
2. Validate:
   ├─ Not expired (ExpiresAt > now)
   ├─ Not locked (Attempts < 3)
   └─ Code matches
        │
        ▼
3. If VALID:
   ├─ session.OtpVerified = true
   ├─ session.OtpVerifiedAt = DateTime.UtcNow
   └─ Delete OTP record
        │
        ▼
4. Record audit: "OTP verified successfully"
        │
        ▼
5. Return { success: true, canSign: true }
```

**Step 5: Complete Signature (eIDAS Requirement 4 — Integrity)**

```
POST /api/v1/signing/{accessToken}/sign
{
  "signatureData": "data:image/png;base64,...",  // Drawn signature
  "consentConfirmed": true
}
        │
        ▼
1. Validate identity + OTP both verified
        │
        ▼
2. Validate consent confirmed
        │
        ▼
3. Get document content from storage
        │
        ▼
4. Compute SHA-256 hash of document
   └─► session.DocumentHash = hash
        │
        ▼
5. Apply digital signature (eSeal):
   ├─ Development: LocalSigningService (self-signed cert)
   └─ Production: AzureKeyVaultSigningService (HSM-backed)
   
   session.DigitalSignature = signature bytes
   session.CertificateSerialNumber = cert serial
   session.CertificateThumbprint = cert thumbprint
        │
        ▼
6. Get RFC 3161 trusted timestamp:
   ├─ Development: LocalTimestampService (mock)
   └─ Production: Real TSA (e.g., DigiCert, Sectigo)
   
   session.TimestampToken = TST response
   session.TimestampedAt = timestamp
   session.TimestampAuthority = TSA name
        │
        ▼
7. Store signature image:
   session.SignatureData = base64 image
   session.SignedAt = DateTime.UtcNow
   session.Status = Signed
        │
        ▼
8. Generate audit trail PDF:
   └─► Contains all events, timestamps, signatures
   session.AuditTrailPdfPath = storage path
        │
        ▼
9. Update proposal status → Signed
        │
        ▼
10. Send confirmation email to customer:
    └─► Link to verify: https://app.com/verify/{shortCode}
        │
        ▼
11. Record audit: "Document signed successfully with AES"
        │
        ▼
12. Return {
      success: true,
      signedDocumentUrl: "...",
      auditTrailUrl: ".../audit-trail"
    }
```

**Verify Document (QR Code / Short Code):**

```
GET /api/v1/signing/verify/{shortCode}
        │
        ▼
Return full signing session details:
- Document hash
- Digital signature info
- Timestamp authority
- Signatory info
- All audit events
```

---

### 5. Audit Trail Generation

Every signing session generates a comprehensive PDF audit trail:

```
┌────────────────────────────────────────────────────────────────┐
│                    AUDIT TRAIL PDF CONTENTS                     │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Document Information                                           │
│  ├─ Reference: PROP-54321                                       │
│  ├─ Title: Motor Insurance Policy                               │
│  ├─ Document Hash (SHA-256): 3a7bd3e2...                        │
│  └─ Created: 2026-01-18 10:30:00 UTC                            │
│                                                                 │
│  Signatory Information                                          │
│  ├─ Name: John Doe (verified)                                   │
│  ├─ ID Number: ****56 (verified)                                │
│  ├─ Email: john@example.com                                     │
│  └─ Business Key: CUST-12345                                    │
│                                                                 │
│  Signature Information                                          │
│  ├─ Signed At: 2026-01-18 10:35:22 UTC                          │
│  ├─ Digital Signature: RSA-SHA256                               │
│  ├─ Certificate: CN=JenusSign eSeal, Serial=1234567890          │
│  ├─ Timestamp: RFC 3161, DigiCert TSA                           │
│  └─ Signature Image: [embedded]                                 │
│                                                                 │
│  Verification Trail                                             │
│  ├─ 10:30:00 - Document viewed (IP: 195.x.x.x, Chrome 120)     │
│  ├─ 10:32:15 - Identity verified (ID_NUMBER method)             │
│  ├─ 10:33:00 - OTP requested via SMS to +357****3456            │
│  ├─ 10:34:10 - OTP verified successfully                        │
│  └─ 10:35:22 - Signature completed with AES                     │
│                                                                 │
│  QR Code: https://app.com/verify/ABC12345                       │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

### 6. Business Key Generation

All entities use human-readable business keys for easy reference:

```csharp
// UserRepository.GenerateBusinessKeyAsync(role):
public async Task<string> GenerateBusinessKeyAsync(UserRole role)
{
    var prefix = role switch
    {
        UserRole.Admin => "ADM",
        UserRole.Employee => "EMP",
        UserRole.Broker => "BRK",
        UserRole.Agent => "AGT",
        _ => "USR"
    };
    
    var count = await _dbSet
        .IgnoreQueryFilters()  // Include soft-deleted
        .CountAsync(u => u.BusinessKey.StartsWith(prefix));
    
    return $"{prefix}-{(count + 1):D3}";  // ADM-001, BRK-002, etc.
}

// CustomerRepository.GenerateBusinessKeyAsync():
// Returns: CUST-00001, CUST-00002, etc.

// ProposalRepository.GenerateBusinessKeyAsync():
// Returns: PROP-00001, PROP-00002, etc.
```

---

### 7. Email Notifications

| Event | Recipient | Content |
|-------|-----------|---------|
| **Signing Request** | Customer | Link to sign document, agent message |
| **Signing Completed** | Customer | Confirmation, verification link |
| **Proposal Expiring** | Customer | Reminder before expiration |
| **Document Signed** | Agent | Notification of completion |

```csharp
// Example: Send signing request
await _emailService.SendSigningRequestAsync(
    customer,           // Recipient
    accessUrl,          // https://app.com/sign/{token}
    customerMessage     // Custom message from agent
);
```

---

## ✍️ Signing Controller (Public — Token-Based)

```
GET  /api/v1/signing/{token}              # Get session info + document
POST /api/v1/signing/{token}/verify-identity  # Verify ID number + name
POST /api/v1/signing/{token}/request-otp      # Send OTP
POST /api/v1/signing/{token}/verify-otp       # Verify OTP
POST /api/v1/signing/{token}/sign             # Complete signature
GET  /api/v1/signing/verify/{shortCode}       # Verify via QR code
GET  /api/v1/signing/{token}/audit-trail      # Download audit PDF
```

---

## ⚙️ Configuration

### appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.;Database=JenusSign;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "Jwt": {
    "SecretKey": "YourSecretKeyAtLeast32CharactersLong!",
    "Issuer": "JenusSign",
    "Audience": "JenusSign",
    "AccessTokenExpiryMinutes": 15,
    "RefreshTokenExpiryDays": 7
  },
  "AzureKeyVault": {
    "VaultUri": "https://your-vault.vault.azure.net/",
    "CertificateName": "jenussign-eseal"
  },
  "Email": {
    "SmtpHost": "smtp.office365.com",
    "SmtpPort": 587,
    "Username": "noreply@yourcompany.com",
    "Password": "your-password",
    "FromName": "JenusSign"
  },
  "Sms": {
    "Provider": "Twilio",
    "AccountSid": "...",
    "AuthToken": "...",
    "FromNumber": "+1234567890"
  }
}
```

### Environment-Based Services

| Service | Development | Production |
|---------|-------------|------------|
| Signing | `LocalSigningService` (self-signed) | `AzureKeyVaultSigningService` (HSM) |
| Timestamp | `LocalTimestampService` | `TimestampService` (RFC 3161) |
| SMS | `MockSmsService` (logs OTP) | Real SMS provider |
| Email | `MockEmailService` | `SmtpEmailService` |

---

## 🧪 Testing

```powershell
# Run all tests
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"

# Run specific test
dotnet test --filter "FullyQualifiedName~AuthIntegrationTests"
```

### Test Categories

- **Integration Tests** — Full HTTP pipeline with in-memory database
- **Unit Tests** — Service and repository isolation

---

## 🚢 Deployment

### IIS

```powershell
dotnet publish -c Release -o ./publish
# Create IIS site → App Pool: No Managed Code → Point to ./publish
```

### Docker

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80 443

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish "src/JenusSign.API/JenusSign.API.csproj" -c Release -o /app/publish

FROM base AS final
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "JenusSign.API.dll"]
```

### Azure App Service

1. Create App Service (.NET 9.0)
2. Configure connection strings in App Settings
3. Enable Managed Identity for Key Vault access
4. Deploy via GitHub Actions / Azure DevOps

---

## 📝 Development Guidelines

### Adding a New Entity

1. Create entity in `JenusSign.Core/Entities/`
2. Add DbSet in `JenusSignDbContext`
3. Create repository interface in `Core/Interfaces/`
4. Implement repository in `Infrastructure/Repositories/`
5. Register in `UnitOfWork`
6. Create DTOs in `Application/DTOs/`
7. Add mapping profile in `Application/Mappings/`
8. Create controller in `API/Controllers/`
9. Add migration

### Adding a New API Endpoint

```
Step 1: Define DTOs (Application/DTOs/)
────────────────────────────────────────
public record CreateXxxRequest(
    string Name,
    string Description
);

public record XxxDto(
    Guid Id,
    string BusinessKey,
    string Name,
    DateTime CreatedAt
);

Step 2: Add Mapping Profile (Application/Mappings/)
────────────────────────────────────────────────────
CreateMap<CreateXxxRequest, Xxx>();
CreateMap<Xxx, XxxDto>();

Step 3: Create Controller Action (API/Controllers/)
───────────────────────────────────────────────────
[HttpPost]
[Authorize(Roles = "Admin,Agent")]
public async Task<ActionResult<XxxDto>> CreateXxx(
    [FromBody] CreateXxxRequest request,
    CancellationToken cancellationToken)
{
    var entity = _mapper.Map<Xxx>(request);
    entity.BusinessKey = await _unitOfWork.Xxx.GenerateBusinessKeyAsync();
    
    await _unitOfWork.Xxx.AddAsync(entity, cancellationToken);
    await _unitOfWork.SaveChangesAsync(cancellationToken);
    
    _logger.LogInformation("Created {Entity} with key {Key}", 
        nameof(Xxx), entity.BusinessKey);
    
    return CreatedAtAction(
        nameof(GetXxx), 
        new { id = entity.Id }, 
        _mapper.Map<XxxDto>(entity));
}
```

### Request/Response Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           REQUEST PIPELINE                                │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   HTTP Request                                                            │
│        │                                                                  │
│        ▼                                                                  │
│   ┌────────────────────┐                                                  │
│   │ Exception Handler  │ ◄── Catches unhandled exceptions                │
│   │ Middleware         │     Returns 500 with error details              │
│   └─────────┬──────────┘                                                  │
│             │                                                             │
│             ▼                                                             │
│   ┌────────────────────┐                                                  │
│   │ Request Logging    │ ◄── Serilog logs request details                │
│   │ Middleware         │                                                  │
│   └─────────┬──────────┘                                                  │
│             │                                                             │
│             ▼                                                             │
│   ┌────────────────────┐                                                  │
│   │ Authentication     │ ◄── JWT Bearer validation                       │
│   │ Middleware         │     Sets User.Claims                            │
│   └─────────┬──────────┘                                                  │
│             │                                                             │
│             ▼                                                             │
│   ┌────────────────────┐                                                  │
│   │ Authorization      │ ◄── [Authorize] attribute checks                │
│   │ Middleware         │     Role-based access                           │
│   └─────────┬──────────┘                                                  │
│             │                                                             │
│             ▼                                                             │
│   ┌────────────────────┐                                                  │
│   │ Controller Action  │ ◄── Business logic                              │
│   │                    │     Returns IActionResult                       │
│   └─────────┬──────────┘                                                  │
│             │                                                             │
│             ▼                                                             │
│   HTTP Response                                                           │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

### Error Handling Patterns

```csharp
// Not Found
return NotFound(new { message = "Customer not found" });

// Bad Request (validation)
return BadRequest(new { message = "Email is required" });

// Unauthorized (not logged in)
return Unauthorized(new { message = "Invalid credentials" });

// Forbidden (logged in but no permission)
return Forbid();  // Returns 403

// Success with data
return Ok(_mapper.Map<CustomerDto>(customer));

// Created with location header
return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, dto);
```

### Code Style

- Use `async/await` throughout
- Inject `IUnitOfWork` for data access
- Return DTOs from controllers, never entities
- Use `CancellationToken` in async methods
- Apply `[Authorize]` attributes appropriately
- Log with Serilog structured logging

### Logging Best Practices

```csharp
// ✅ Good - Structured logging with context
_logger.LogInformation("User {Email} logged in from {IpAddress}", 
    user.Email, ipAddress);

_logger.LogWarning("Failed login attempt for {Email}", email);

_logger.LogError(ex, "Failed to sign document for session {SessionId}", 
    session.Id);

// ❌ Bad - String interpolation
_logger.LogInformation($"User {user.Email} logged in");
```

---

## 🔍 Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 on all requests | Token expired | Refresh token or re-login |
| 403 Forbidden | Role doesn't have access | Check `[Authorize(Roles)]` |
| 500 on startup | DB connection failed | Check connection string |
| Empty customer list | Role filtering | Agent only sees own data |
| OTP not received | Mock service in dev | Check console logs |

### Debug Logging

```powershell
# Set minimum log level to Debug in appsettings.Development.json
{
  "Serilog": {
    "MinimumLevel": {
      "Default": "Debug",
      "Override": {
        "Microsoft": "Warning",
        "Microsoft.EntityFrameworkCore": "Information"
      }
    }
  }
}
```

---

## 📄 License

Proprietary — Jenus Insurance Ltd © 2025-2026
