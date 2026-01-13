using System.Text;
using JenusSign.Application.Mappings;
using JenusSign.Core.Interfaces;
using JenusSign.Infrastructure.Data;
using JenusSign.Infrastructure.Repositories;
using JenusSign.Infrastructure.Services;
using JenusSign.Infrastructure.Services.Email;
using JenusSign.Infrastructure.Services.Pdf;
using JenusSign.Infrastructure.Services.Signing;
using JenusSign.Infrastructure.Services.Sms;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/jenussign-.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container

// Database
builder.Services.AddDbContext<JenusSignDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    if (string.IsNullOrEmpty(connectionString) || connectionString.Contains("InMemory"))
    {
        // Use in-memory database for development
        options.UseInMemoryDatabase("JenusSignDb");
    }
    else
    {
        options.UseSqlServer(connectionString, sqlOptions =>
        {
            sqlOptions.EnableRetryOnFailure(maxRetryCount: 3);
        });
    }
});

// Repositories
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Services - use environment to determine implementations
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddScoped<ISigningService, LocalSigningService>();
    builder.Services.AddScoped<ITimestampService, LocalTimestampService>();
    builder.Services.AddScoped<ISmsService, MockSmsService>();
}
else
{
    builder.Services.AddScoped<ISigningService, AzureKeyVaultSigningService>();
    builder.Services.AddHttpClient<ITimestampService, TimestampService>();
    builder.Services.AddScoped<ISmsService, TwilioSmsService>();
}

builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IOtpService, OtpService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IPdfService, PdfService>();
builder.Services.AddScoped<IDocumentStorageService, LocalDocumentStorageService>();

// AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile));

// JWT Authentication
var jwtSecretKey = builder.Configuration["Jwt:SecretKey"] ?? "JenusSignDefaultSecretKey2025ForDevelopmentOnly!";
var key = Encoding.UTF8.GetBytes(jwtSecretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "JenusSign",
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "JenusSign",
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                builder.Configuration["Cors:AllowedOrigins"]?.Split(',') ?? 
                new[] { "http://localhost:5173", "http://localhost:3000", "https://jenussign.jenusplanet.com" })
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "JenusSign API",
        Version = "v1",
        Description = "eIDAS-compliant digital signing platform API",
        Contact = new OpenApiContact
        {
            Name = "Jenus Insurance Ltd",
            Email = "support@jenusplanet.com"
        }
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Health checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<JenusSignDbContext>();

var app = builder.Build();

// Configure the HTTP request pipeline

// Global exception handler
app.UseExceptionHandler("/error");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "JenusSign API v1");
        options.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapHealthChecks("/health");

// Error endpoint
app.Map("/error", (HttpContext context) =>
{
    return Results.Problem();
});

// Seed demo data in development
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<JenusSignDbContext>();
    await SeedDemoDataAsync(context);
}

Log.Information("JenusSign API starting on {Urls}", string.Join(", ", app.Urls));

app.Run();

// Demo data seeding
static async Task SeedDemoDataAsync(JenusSignDbContext context)
{
    if (await context.Users.AnyAsync())
        return;

    // Create demo users matching frontend mock data
    var admin = new JenusSign.Core.Entities.User
    {
        BusinessKey = "ADM-001",
        Email = "admin@insurance.com",
        PasswordHash = JenusSign.API.Controllers.AuthController.HashPassword("admin123"),
        FirstName = "Admin",
        LastName = "User",
        Role = JenusSign.Core.Enums.UserRole.Admin,
        IsActive = true
    };

    var broker = new JenusSign.Core.Entities.User
    {
        BusinessKey = "BRK-001",
        Email = "broker@insurance.com",
        PasswordHash = JenusSign.API.Controllers.AuthController.HashPassword("broker123"),
        FirstName = "John",
        LastName = "Broker",
        Role = JenusSign.Core.Enums.UserRole.Broker,
        IsActive = true
    };

    var employee = new JenusSign.Core.Entities.User
    {
        BusinessKey = "EMP-001",
        Email = "employee@insurance.com",
        PasswordHash = JenusSign.API.Controllers.AuthController.HashPassword("employee123"),
        FirstName = "Employee",
        LastName = "User",
        Role = JenusSign.Core.Enums.UserRole.Employee,
        IsActive = true
    };

    context.Users.AddRange(admin, broker, employee);
    await context.SaveChangesAsync();

    var agent1 = new JenusSign.Core.Entities.User
    {
        BusinessKey = "AGT-001",
        Email = "agent@insurance.com",
        PasswordHash = JenusSign.API.Controllers.AuthController.HashPassword("agent123"),
        FirstName = "Sarah",
        LastName = "Agent",
        Role = JenusSign.Core.Enums.UserRole.Agent,
        BrokerId = broker.Id,
        IsActive = true
    };

    var agent2 = new JenusSign.Core.Entities.User
    {
        BusinessKey = "AGT-002",
        Email = "agent2@insurance.com",
        PasswordHash = JenusSign.API.Controllers.AuthController.HashPassword("agent123"),
        FirstName = "Mike",
        LastName = "Agent",
        Role = JenusSign.Core.Enums.UserRole.Agent,
        BrokerId = broker.Id,
        IsActive = true
    };

    context.Users.AddRange(agent1, agent2);
    await context.SaveChangesAsync();

    // Create demo customers
    var customer1 = new JenusSign.Core.Entities.Customer
    {
        BusinessKey = "CUST-12345",
        CustomerType = JenusSign.Core.Enums.CustomerType.Individual,
        FirstName = "John",
        LastName = "Doe",
        Email = "john.doe@email.com",
        Phone = "+357 99 123 456",
        Address = "25 Makarios Avenue",
        City = "Nicosia",
        PostalCode = "1065",
        Country = "Cyprus",
        IdNumber = "K123456",
        AgentId = agent1.Id
    };

    var customer2 = new JenusSign.Core.Entities.Customer
    {
        BusinessKey = "CUST-12346",
        CustomerType = JenusSign.Core.Enums.CustomerType.Corporate,
        FirstName = "ACME",
        LastName = "Corporation",
        CompanyName = "ACME Corporation",
        Email = "info@acme.com",
        Phone = "+357 22 123 456",
        Address = "10 Business Park",
        City = "Limassol",
        PostalCode = "3025",
        Country = "Cyprus",
        RegistrationNumber = "HE123456",
        AgentId = agent1.Id
    };

    var customer3 = new JenusSign.Core.Entities.Customer
    {
        BusinessKey = "CUST-12347",
        CustomerType = JenusSign.Core.Enums.CustomerType.Individual,
        FirstName = "Jane",
        LastName = "Smith",
        Email = "jane.smith@email.com",
        Phone = "+357 99 654 321",
        Address = "15 Griva Digeni",
        City = "Larnaca",
        PostalCode = "6000",
        Country = "Cyprus",
        IdNumber = "M654321",
        AgentId = agent2.Id
    };

    context.Customers.AddRange(customer1, customer2, customer3);
    await context.SaveChangesAsync();

    // Create demo proposals
    var proposal1 = new JenusSign.Core.Entities.Proposal
    {
        BusinessKey = "PROP-54321",
        ReferenceNumber = "PR-2025-0001",
        Title = "Home Insurance Proposal",
        ProposalType = JenusSign.Core.Enums.ProposalType.Home,
        Status = JenusSign.Core.Enums.ProposalStatus.PendingSignature,
        Premium = 1250.00m,
        SumInsured = 350000.00m,
        Excess = 250.00m,
        IssueDate = DateTime.UtcNow.AddDays(-5),
        ValidUntil = DateTime.UtcNow.AddDays(30),
        CustomerId = customer1.Id,
        AgentId = agent1.Id,
        RequiredSignatureType = JenusSign.Core.Enums.SignatureType.AES
    };

    var proposal2 = new JenusSign.Core.Entities.Proposal
    {
        BusinessKey = "PROP-54322",
        ReferenceNumber = "PR-2025-0002",
        Title = "Motor Insurance Proposal",
        ProposalType = JenusSign.Core.Enums.ProposalType.Motor,
        Status = JenusSign.Core.Enums.ProposalStatus.Draft,
        Premium = 850.00m,
        SumInsured = 25000.00m,
        Excess = 150.00m,
        IssueDate = DateTime.UtcNow.AddDays(-2),
        ValidUntil = DateTime.UtcNow.AddDays(30),
        CustomerId = customer2.Id,
        AgentId = agent1.Id,
        RequiredSignatureType = JenusSign.Core.Enums.SignatureType.AES
    };

    var proposal3 = new JenusSign.Core.Entities.Proposal
    {
        BusinessKey = "PROP-54323",
        ReferenceNumber = "PR-2025-0003",
        Title = "Life Insurance Proposal",
        ProposalType = JenusSign.Core.Enums.ProposalType.Life,
        Status = JenusSign.Core.Enums.ProposalStatus.Signed,
        Premium = 500.00m,
        SumInsured = 100000.00m,
        IssueDate = DateTime.UtcNow.AddDays(-10),
        ValidUntil = DateTime.UtcNow.AddDays(30),
        CustomerId = customer3.Id,
        AgentId = agent2.Id,
        RequiredSignatureType = JenusSign.Core.Enums.SignatureType.AES
    };

    context.Proposals.AddRange(proposal1, proposal2, proposal3);
    await context.SaveChangesAsync();

    Log.Information("Demo data seeded successfully");
}
