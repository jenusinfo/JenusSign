using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text;
using JenusSign.Application.DTOs;
using JenusSign.Core.Enums;
using JenusSign.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Xunit;

namespace JenusSign.Tests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _dbName = $"JenusSignTestDb_{Guid.NewGuid()}";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");

        builder.ConfigureAppConfiguration((context, configBuilder) =>
        {
            var settings = new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = "InMemory",
                ["Jwt:SecretKey"] = "JenusSignSecretKey2025ForProductionChangeThis!AtLeast32Characters",
                ["Jwt:Issuer"] = "JenusSign",
                ["Jwt:Audience"] = "JenusSign"
            };

            configBuilder.AddInMemoryCollection(settings);
        });

        builder.ConfigureServices(services =>
        {
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<JenusSignDbContext>));
            if (descriptor != null)
            {
                services.Remove(descriptor);
            }

            services.AddDbContext<JenusSignDbContext>(options =>
                options.UseInMemoryDatabase(_dbName));

            using var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<JenusSignDbContext>();
            db.Database.EnsureDeleted();
            db.Database.EnsureCreated();

            var configuration = sp.GetRequiredService<IConfiguration>();
            services.PostConfigure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme, options =>
            {
                var key = Encoding.UTF8.GetBytes(configuration["Jwt:SecretKey"] ?? throw new InvalidOperationException("Jwt:SecretKey is missing"));
                options.RequireHttpsMetadata = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = configuration["Jwt:Issuer"] ?? "JenusSign",
                    ValidateAudience = true,
                    ValidAudience = configuration["Jwt:Audience"] ?? "JenusSign",
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };
            });
        });
    }
}

public class AuthIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() }
    };

    public AuthIntegrationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Login_ReturnsTokens_ForSeededAdmin()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest(
            Email: "admin@insurance.com",
            Password: "admin123"));

        response.EnsureSuccessStatusCode();

        var payload = await response.Content.ReadFromJsonAsync<LoginResponse>(JsonOptions);

        Assert.NotNull(payload);
        Assert.False(string.IsNullOrWhiteSpace(payload!.AccessToken));
        Assert.False(string.IsNullOrWhiteSpace(payload.RefreshToken));
        Assert.NotNull(payload.User);
        Assert.Equal(UserRole.Admin, payload.User!.Role);
        Assert.Equal("admin@insurance.com", payload.User.Email);
    }

    [Fact]
    public async Task Admin_Can_Create_User_And_Retrieve_By_BusinessKey()
    {
        var client = _factory.CreateClient();

        var login = await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest(
            Email: "admin@insurance.com",
            Password: "admin123"));

        login.EnsureSuccessStatusCode();

        var loginPayload = await login.Content.ReadFromJsonAsync<LoginResponse>(JsonOptions);
        Assert.NotNull(loginPayload?.AccessToken);

        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", loginPayload!.AccessToken);

        var request = new CreateUserRequest(
            Email: "new.employee@insurance.com",
            Password: "Password1!",
            FirstName: "New",
            LastName: "Employee",
            Phone: "+123456789",
            Role: UserRole.Employee,
            BrokerId: null);

        var create = await client.PostAsJsonAsync("/api/v1/users", request);
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);

        var createdUser = await create.Content.ReadFromJsonAsync<UserDto>(JsonOptions);
        Assert.NotNull(createdUser);
        Assert.Equal(request.Email, createdUser!.Email);
        Assert.Equal(UserRole.Employee, createdUser.Role);

        var brokerResponse = await client.GetAsync("/api/v1/users/by-key/BRK-001");
        brokerResponse.EnsureSuccessStatusCode();

        var broker = await brokerResponse.Content.ReadFromJsonAsync<UserDto>(JsonOptions);
        Assert.NotNull(broker);
        Assert.Equal(UserRole.Broker, broker!.Role);
        Assert.Equal("broker@insurance.com", broker.Email);
    }

    [Fact]
    public async Task Can_Refresh_Token_And_Use_New_Access_Token()
    {
        var client = _factory.CreateClient();

        var login = await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest(
            Email: "admin@insurance.com",
            Password: "admin123"));

        login.EnsureSuccessStatusCode();

        var loginPayload = await login.Content.ReadFromJsonAsync<LoginResponse>(JsonOptions);
        Assert.NotNull(loginPayload);

        var refresh = await client.PostAsJsonAsync("/api/v1/auth/refresh", new RefreshTokenRequest(loginPayload!.RefreshToken!));
        refresh.EnsureSuccessStatusCode();

        var refreshed = await refresh.Content.ReadFromJsonAsync<TokenResponse>(JsonOptions);
        Assert.NotNull(refreshed);
        Assert.False(string.IsNullOrWhiteSpace(refreshed!.AccessToken));

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", refreshed.AccessToken);

        var me = await client.GetAsync("/api/v1/auth/me");
        me.EnsureSuccessStatusCode();

        var meDto = await me.Content.ReadFromJsonAsync<UserDto>(JsonOptions);
        Assert.NotNull(meDto);
        Assert.Equal(UserRole.Admin, meDto!.Role);
    }

    [Fact]
    public async Task Logout_Invalidates_Refresh_Token()
    {
        var client = _factory.CreateClient();

        var login = await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest(
            Email: "admin@insurance.com",
            Password: "admin123"));

        login.EnsureSuccessStatusCode();
        var loginPayload = await login.Content.ReadFromJsonAsync<LoginResponse>(JsonOptions);
        Assert.NotNull(loginPayload);

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", loginPayload!.AccessToken);

        var logout = await client.PostAsync("/api/v1/auth/logout", content: null);
        logout.EnsureSuccessStatusCode();

        var refresh = await client.PostAsJsonAsync("/api/v1/auth/refresh", new RefreshTokenRequest(loginPayload.RefreshToken!));
        Assert.Equal(HttpStatusCode.Unauthorized, refresh.StatusCode);
    }

    [Fact]
    public async Task Broker_Cannot_Create_User_Admin_Can()
    {
        var client = _factory.CreateClient();

        // Admin create should succeed
        var adminLogin = await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest("admin@insurance.com", "admin123"));
        adminLogin.EnsureSuccessStatusCode();
        var adminPayload = await adminLogin.Content.ReadFromJsonAsync<LoginResponse>(JsonOptions);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminPayload!.AccessToken);

        var createAsAdmin = await client.PostAsJsonAsync("/api/v1/users", new CreateUserRequest(
            Email: "temp.user@insurance.com",
            Password: "Password1!",
            FirstName: "Temp",
            LastName: "User",
            Phone: "+111111",
            Role: UserRole.Employee,
            BrokerId: null));
        Assert.Equal(HttpStatusCode.Created, createAsAdmin.StatusCode);

        // Broker login
        var brokerLogin = await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest("broker@insurance.com", "broker123"));
        brokerLogin.EnsureSuccessStatusCode();
        var brokerPayload = await brokerLogin.Content.ReadFromJsonAsync<LoginResponse>(JsonOptions);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", brokerPayload!.AccessToken);

        var createAsBroker = await client.PostAsJsonAsync("/api/v1/users", new CreateUserRequest(
            Email: "should.fail@insurance.com",
            Password: "Password1!",
            FirstName: "Should",
            LastName: "Fail",
            Phone: "+222222",
            Role: UserRole.Employee,
            BrokerId: null));

        Assert.Equal(HttpStatusCode.Forbidden, createAsBroker.StatusCode);
    }
}
