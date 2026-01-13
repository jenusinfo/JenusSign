# JenusSign API - ASP.NET Core 9.0 Backend

eIDAS Article 26 compliant Advanced Electronic Signature (AES) platform for the Cyprus insurance market.

## 🏗️ Architecture

```
JenusSign.sln
├── src/
│   ├── JenusSign.API          # Web API controllers, middleware, configuration
│   ├── JenusSign.Application  # DTOs, AutoMapper profiles, validators
│   ├── JenusSign.Core         # Domain entities, enums, interfaces
│   └── JenusSign.Infrastructure  # EF Core, repositories, external services
└── tests/
    └── JenusSign.Tests        # Unit and integration tests
```

## 🚀 Quick Start

### Prerequisites
- .NET 9.0 SDK
- SQL Server (or use in-memory for development)
- Azure subscription (for production Key Vault)

### Run in Development Mode

```bash
cd src/JenusSign.API
dotnet restore
dotnet run
```

The API will start at `https://localhost:7001` with Swagger UI at `/swagger`.

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@insurance.com | admin123 |
| Employee | employee@insurance.com | employee123 |
| Broker | broker@insurance.com | broker123 |
| Agent | agent@insurance.com | agent123 |

## 📡 API Endpoints

### Authentication
```
POST /api/v1/auth/login          # Login with email/password
POST /api/v1/auth/refresh        # Refresh access token
POST /api/v1/auth/logout         # Logout and invalidate tokens
GET  /api/v1/auth/me             # Get current user info
```

### Users (Admin only)
```
GET    /api/v1/users             # List all users
GET    /api/v1/users/{id}        # Get user by ID
GET    /api/v1/users/by-key/{key}  # Get user by business key
POST   /api/v1/users             # Create new user
PUT    /api/v1/users/{id}        # Update user
GET    /api/v1/users/brokers     # List all brokers
GET    /api/v1/users/brokers/{id}/agents  # List agents under broker
```

### Customers
```
GET    /api/v1/customers         # List customers (role-filtered)
GET    /api/v1/customers/{id}    # Get customer by ID
GET    /api/v1/customers/by-key/{key}  # Get by business key
POST   /api/v1/customers         # Create new customer
PUT    /api/v1/customers/{id}    # Update customer
DELETE /api/v1/customers/{id}    # Soft delete (Admin only)
```

### Proposals
```
GET    /api/v1/proposals         # List proposals (role-filtered)
GET    /api/v1/proposals/{id}    # Get proposal by ID
GET    /api/v1/proposals/by-reference/{ref}  # Get by reference number
POST   /api/v1/proposals         # Create new proposal
PUT    /api/v1/proposals/{id}    # Update proposal
POST   /api/v1/proposals/{id}/send  # Send for signing
GET    /api/v1/proposals/customer/{id}  # Get proposals by customer
```

### Customer Signing Portal (No auth - uses access tokens)
```
GET    /api/v1/signing/{token}   # Get signing session info
POST   /api/v1/signing/{token}/verify-identity  # Verify identity
POST   /api/v1/signing/{token}/request-otp  # Request OTP
POST   /api/v1/signing/{token}/verify-otp   # Verify OTP
POST   /api/v1/signing/{token}/sign         # Complete signature
GET    /api/v1/signing/verify/{shortCode}   # Verify by QR code
GET    /api/v1/signing/{token}/audit-trail  # Download audit PDF
```

## 🔐 Role-Based Authorization

| Role | See Customers | See Proposals | User Management |
|------|---------------|---------------|-----------------|
| Admin | All | All | Full CRUD |
| Employee | All | All | Read only |
| Broker | Under their agents | Under their agents | Read only |
| Agent | Own only | Own only | Read only |

## 🔒 eIDAS Article 26 Compliance

The platform implements all four requirements:

1. **Uniquely linked to signatory** - Identity verification with ID scan + OTP
2. **Capable of identifying signatory** - Captured signature, verified identity
3. **Signatory sole control** - OTP verification ensures only customer can sign
4. **Detects subsequent changes** - SHA-256 hash + cryptographic signature

### Signing Workflow

```
1. Agent creates proposal → sends signing link to customer
2. Customer opens link → views document
3. Customer verifies identity (ID number + name match)
4. Customer requests OTP → verifies OTP
5. Customer draws signature → confirms consent
6. System applies:
   - SHA-256 document hash
   - Digital signature with JCC eSeal
   - RFC 3161 trusted timestamp
7. Generates audit trail PDF
8. Sends confirmation to customer
```

## ⚙️ Configuration

### appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.;Database=JenusSign;Trusted_Connection=True;"
  },
  "Jwt": {
    "SecretKey": "YourSecretKeyAtLeast32Characters!",
    "Issuer": "JenusSign",
    "Audience": "JenusSign"
  },
  "AzureKeyVault": {
    "VaultUri": "https://your-vault.vault.azure.net/",
    "CertificateName": "jenussign-eseal"
  },
  "Email": {
    "SmtpHost": "smtp.office365.com",
    "SmtpPort": 587,
    "Username": "your-email",
    "Password": "your-password"
  }
}
```

### Azure Key Vault Setup (Production)

1. Create Azure Key Vault Premium (HSM-backed)
2. Import JCC Qualified eSeal certificate
3. Grant the API managed identity access
4. Configure `AzureKeyVault:VaultUri` and `AzureKeyVault:CertificateName`

## 🗄️ Database

### Entity Framework Migrations

```bash
# Create migration
dotnet ef migrations add InitialCreate -p src/JenusSign.Infrastructure -s src/JenusSign.API

# Apply migrations
dotnet ef database update -p src/JenusSign.Infrastructure -s src/JenusSign.API
```

### Business Keys

| Entity | Format | Example |
|--------|--------|---------|
| Admin | ADM-XXX | ADM-001 |
| Employee | EMP-XXX | EMP-001 |
| Broker | BRK-XXX | BRK-001 |
| Agent | AGT-XXX | AGT-001 |
| Customer | CUST-XXXXX | CUST-12345 |
| Proposal | PROP-XXXXX | PROP-54321 |
| Envelope | ENV-XXXXX | ENV-00001 |

## 🔗 Frontend Integration

Update your React frontend's API calls:

```javascript
// src/api/api.js
const API_BASE = 'https://your-api.com/api/v1';

// Login
const login = async (email, password) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};

// Get customers (with auth token)
const getCustomers = async (token) => {
  const response = await fetch(`${API_BASE}/customers`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

## 📊 Health Check

```
GET /health
```

Returns database connectivity status.

## 🚀 Deployment

### IIS Deployment

1. Publish: `dotnet publish -c Release -o ./publish`
2. Create IIS site pointing to `./publish`
3. Configure app pool for .NET CLR version: No Managed Code
4. Set environment variables or use web.config transforms

### Azure App Service

1. Create App Service with .NET 9.0 runtime
2. Configure connection strings in App Settings
3. Enable managed identity for Key Vault access
4. Deploy via GitHub Actions or Azure DevOps

### Docker

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish "src/JenusSign.API/JenusSign.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "JenusSign.API.dll"]
```

## 📝 Version History

- **v1.0.0** - Initial release with full eIDAS AES compliance
  - JWT authentication
  - Role-based authorization
  - Customer, Proposal, User management
  - Complete signing workflow
  - Azure Key Vault integration
  - RFC 3161 timestamping
  - Audit trail PDF generation

## 🤝 Integration with Hydra

For Hydra's self-hosted deployment:

1. Deploy to Hydra's Azure tenant
2. Configure SQL Server connection
3. Import JCC certificate to Key Vault
4. Configure Navins sync endpoints (future)
5. Jenus provides second-level support

## 📄 License

Proprietary - Jenus Insurance Ltd © 2025
