using AutoMapper;
using JenusSign.Application.DTOs;
using JenusSign.Core.Entities;
using JenusSign.Core.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JenusSign.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITokenService _tokenService;
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly IMapper _mapper;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IUnitOfWork unitOfWork,
        ITokenService tokenService,
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        IMapper mapper,
        ILogger<AuthController> logger)
    {
        _unitOfWork = unitOfWork;
        _tokenService = tokenService;
        _userManager = userManager;
        _signInManager = signInManager;
        _mapper = mapper;
        _logger = logger;
    }

    /// <summary>
    /// Login with email and password
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);

        if (user == null || !user.IsActive || user.IsDeleted)
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }

        var signInResult = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
        if (!signInResult.Succeeded)
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }

        // Generate tokens
        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();

        // Save refresh token
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(7);
        user.LastLoginAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        _logger.LogInformation("User {Email} logged in successfully", user.Email);

        return Ok(new LoginResponse(
            RequiresOtp: false,
            OtpToken: null,
            AccessToken: accessToken,
            RefreshToken: refreshToken,
            User: _mapper.Map<UserDto>(user)
        ));
    }

    /// <summary>
    /// Refresh access token
    /// </summary>
    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<ActionResult<TokenResponse>> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        try
        {
            var (accessToken, refreshToken) = await _tokenService.RefreshTokensAsync(request.RefreshToken);
            
            return Ok(new TokenResponse(
                AccessToken: accessToken,
                RefreshToken: refreshToken,
                ExpiresAt: DateTime.UtcNow.AddMinutes(60)
            ));
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { message = "Invalid or expired refresh token" });
        }
    }

    /// <summary>
    /// Logout and invalidate refresh token
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    public async Task<ActionResult> Logout()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(userId, out var id))
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id);
            if (user != null)
            {
                user.RefreshToken = null;
                user.RefreshTokenExpiresAt = null;
                await _unitOfWork.Users.UpdateAsync(user);
                await _unitOfWork.SaveChangesAsync();
            }
        }

        return Ok(new { message = "Logged out successfully" });
    }

    /// <summary>
    /// Get current user info
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userId, out var id))
        {
            return Unauthorized();
        }

        var user = await _userManager.FindByIdAsync(userId!);
        if (user == null)
        {
            return NotFound();
        }

        return Ok(_mapper.Map<UserDto>(user));
    }
}
