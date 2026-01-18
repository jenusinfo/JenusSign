using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using JenusSign.Core.Entities;
using JenusSign.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace JenusSign.Infrastructure.Services;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;
    private readonly IUnitOfWork _unitOfWork;
    private readonly string _secretKey;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly int _accessTokenMinutes;
    private readonly int _refreshTokenDays;

    public TokenService(IConfiguration configuration, IUnitOfWork unitOfWork)
    {
        _configuration = configuration;
        _unitOfWork = unitOfWork;
        _secretKey = configuration["Jwt:SecretKey"] ?? throw new ArgumentNullException("Jwt:SecretKey");
        _issuer = configuration["Jwt:Issuer"] ?? "JenusSign";
        _audience = configuration["Jwt:Audience"] ?? "JenusSign";
        _accessTokenMinutes = configuration.GetValue<int>("Jwt:AccessTokenMinutes", 60);
        _refreshTokenDays = configuration.GetValue<int>("Jwt:RefreshTokenDays", 7);
    }

    public string GenerateAccessToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("BusinessKey", user.BusinessKey),
            new Claim("BrokerId", user.BrokerId?.ToString() ?? "")
        };

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_accessTokenMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    public async Task<(string AccessToken, string RefreshToken)> RefreshTokensAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        var users = await _unitOfWork.Users.FindAsync(u => u.RefreshToken == refreshToken, cancellationToken);
        var user = users.FirstOrDefault();

        if (user == null || user.RefreshTokenExpiresAt < DateTime.UtcNow)
            throw new UnauthorizedAccessException("Invalid or expired refresh token");

        var newAccessToken = GenerateAccessToken(user);
        var newRefreshToken = GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(_refreshTokenDays);
        await _unitOfWork.Users.UpdateAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return (newAccessToken, newRefreshToken);
    }

    public bool ValidateToken(string token)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
        var handler = new JwtSecurityTokenHandler();

        try
        {
            handler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = _issuer,
                ValidAudience = _audience,
                IssuerSigningKey = key
            }, out _);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public string GenerateCustomerAccessToken(Customer customer)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim("CustomerId", customer.Id.ToString()),
            new Claim(ClaimTypes.Email, customer.Email),
            new Claim(ClaimTypes.Name, customer.DisplayName),
            new Claim("BusinessKey", customer.BusinessKey),
            new Claim("TokenType", "Customer")
        };

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: $"{_audience}-Customer",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24), // Customer tokens last 24 hours
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<(string AccessToken, string RefreshToken)> RefreshCustomerTokensAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        // Customer refresh tokens would be stored in a separate mechanism
        // For now, we'll validate against the customer's stored token
        var customers = await _unitOfWork.Customers.FindAsync(c => c.RefreshToken == refreshToken, cancellationToken);
        var customer = customers.FirstOrDefault();

        if (customer == null || customer.RefreshTokenExpiresAt < DateTime.UtcNow)
            throw new UnauthorizedAccessException("Invalid or expired refresh token");

        var newAccessToken = GenerateCustomerAccessToken(customer);
        var newRefreshToken = GenerateRefreshToken();

        customer.RefreshToken = newRefreshToken;
        customer.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(_refreshTokenDays);
        await _unitOfWork.Customers.UpdateAsync(customer, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return (newAccessToken, newRefreshToken);
    }
}
