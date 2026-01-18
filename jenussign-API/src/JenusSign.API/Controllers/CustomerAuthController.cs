using AutoMapper;
using JenusSign.Application.DTOs;
using JenusSign.Core.Entities;
using JenusSign.Core.Enums;
using JenusSign.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JenusSign.API.Controllers;

/// <summary>
/// Customer authentication via OTP (no password required)
/// Used by Customer Portal for viewing their proposals/envelopes
/// </summary>
[ApiController]
[Route("api/v1/customer-auth")]
public class CustomerAuthController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IEmailService _emailService;
    private readonly ISmsService _smsService;
    private readonly ITokenService _tokenService;
    private readonly ILogger<CustomerAuthController> _logger;
    private readonly Random _random = new();

    public CustomerAuthController(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        IEmailService emailService,
        ISmsService smsService,
        ITokenService tokenService,
        ILogger<CustomerAuthController> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _emailService = emailService;
        _smsService = smsService;
        _tokenService = tokenService;
        _logger = logger;
    }

    /// <summary>
    /// Request OTP for customer login (by email or phone)
    /// </summary>
    [HttpPost("request-otp")]
    [AllowAnonymous]
    public async Task<ActionResult<CustomerOtpResponse>> RequestOtp([FromBody] CustomerOtpRequest request)
    {
        // Find customer by email or phone
        Customer? customer = null;
        string destination;
        OtpChannel channel;

        if (!string.IsNullOrEmpty(request.Email))
        {
            customer = await _unitOfWork.Customers.GetByEmailAsync(request.Email);
            destination = request.Email;
            channel = OtpChannel.Email;
        }
        else if (!string.IsNullOrEmpty(request.Phone))
        {
            var customers = await _unitOfWork.Customers.FindAsync(c => c.Phone == request.Phone);
            customer = customers.FirstOrDefault();
            destination = request.Phone;
            channel = OtpChannel.Sms;
        }
        else
        {
            return BadRequest(new { message = "Email or phone is required" });
        }

        if (customer == null || customer.IsDeleted)
        {
            // Don't reveal if customer exists - always return success
            _logger.LogWarning("OTP requested for non-existent customer: {Destination}", destination);
            return Ok(new CustomerOtpResponse(
                Success: true,
                MaskedDestination: MaskDestination(destination, channel),
                Channel: channel,
                ExpiresAt: DateTime.UtcNow.AddMinutes(5),
                OtpToken: Guid.NewGuid().ToString("N"),
                Message: "If an account exists, you will receive an OTP shortly"
            ));
        }

        // Generate OTP
        var otpCode = GenerateOtpCode();
        var otpToken = Guid.NewGuid().ToString("N");

        // Store OTP
        var otp = new OtpCode
        {
            Code = otpCode,
            CustomerId = customer.Id,
            Channel = channel,
            Token = otpToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(5),
            Purpose = OtpPurpose.CustomerLogin
        };

        await _unitOfWork.OtpCodes.AddAsync(otp);
        await _unitOfWork.SaveChangesAsync();

        // Send OTP
        bool sent;
        if (channel == OtpChannel.Email)
        {
            sent = await _emailService.SendOtpAsync(customer.Email, otpCode);
        }
        else
        {
            sent = await _smsService.SendOtpAsync(customer.Phone, otpCode);
        }

        if (!sent)
        {
            _logger.LogError("Failed to send OTP to {Destination}", destination);
        }

        _logger.LogInformation("OTP sent to customer {CustomerId} via {Channel}", customer.Id, channel);

        return Ok(new CustomerOtpResponse(
            Success: true,
            MaskedDestination: MaskDestination(destination, channel),
            Channel: channel,
            ExpiresAt: otp.ExpiresAt,
            OtpToken: otpToken,
            Message: "OTP sent successfully"
        ));
    }

    /// <summary>
    /// Verify OTP and login customer
    /// </summary>
    [HttpPost("verify-otp")]
    [AllowAnonymous]
    public async Task<ActionResult<CustomerLoginResponse>> VerifyOtp([FromBody] CustomerVerifyOtpRequest request)
    {
        // Find OTP by token
        var otpCodes = await _unitOfWork.OtpCodes.FindAsync(o => 
            o.Token == request.OtpToken && 
            o.Purpose == OtpPurpose.CustomerLogin);
        
        var otp = otpCodes.FirstOrDefault();

        if (otp == null)
        {
            return Unauthorized(new { message = "Invalid or expired OTP token" });
        }

        // Check if expired
        if (otp.ExpiresAt < DateTime.UtcNow)
        {
            await _unitOfWork.OtpCodes.DeleteAsync(otp);
            await _unitOfWork.SaveChangesAsync();
            return Unauthorized(new { message = "OTP has expired. Please request a new one." });
        }

        // Check if locked (too many attempts)
        if (otp.Attempts >= 3)
        {
            await _unitOfWork.OtpCodes.DeleteAsync(otp);
            await _unitOfWork.SaveChangesAsync();
            return Unauthorized(new { message = "Too many failed attempts. Please request a new OTP." });
        }

        // Verify code
        if (otp.Code != request.Code)
        {
            otp.Attempts++;
            await _unitOfWork.OtpCodes.UpdateAsync(otp);
            await _unitOfWork.SaveChangesAsync();

            return Unauthorized(new { 
                message = "Invalid OTP code",
                attemptsRemaining = 3 - otp.Attempts
            });
        }

        // Get customer
        var customer = await _unitOfWork.Customers.GetByIdAsync(otp.CustomerId!.Value);
        if (customer == null)
        {
            return Unauthorized(new { message = "Customer not found" });
        }

        // Generate customer token
        var accessToken = _tokenService.GenerateCustomerAccessToken(customer);
        var refreshToken = _tokenService.GenerateRefreshToken();

        // Delete OTP (one-time use)
        await _unitOfWork.OtpCodes.DeleteAsync(otp);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Customer {CustomerId} logged in via OTP", customer.Id);

        return Ok(new CustomerLoginResponse(
            Success: true,
            AccessToken: accessToken,
            RefreshToken: refreshToken,
            Customer: _mapper.Map<CustomerDto>(customer),
            ExpiresAt: DateTime.UtcNow.AddHours(24)
        ));
    }

    /// <summary>
    /// Get current customer info
    /// </summary>
    [HttpGet("me")]
    [Authorize(Policy = "CustomerPolicy")]
    public async Task<ActionResult<CustomerDto>> GetCurrentCustomer()
    {
        var customerId = User.FindFirst("CustomerId")?.Value;
        if (!Guid.TryParse(customerId, out var id))
        {
            return Unauthorized();
        }

        var customer = await _unitOfWork.Customers.GetByIdAsync(id);
        if (customer == null)
        {
            return NotFound();
        }

        return Ok(_mapper.Map<CustomerDto>(customer));
    }

    /// <summary>
    /// Refresh customer token
    /// </summary>
    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<ActionResult<CustomerLoginResponse>> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        try
        {
            var (accessToken, refreshToken) = await _tokenService.RefreshCustomerTokensAsync(request.RefreshToken);
            
            return Ok(new CustomerLoginResponse(
                Success: true,
                AccessToken: accessToken,
                RefreshToken: refreshToken,
                Customer: null, // Customer info not included in refresh
                ExpiresAt: DateTime.UtcNow.AddHours(24)
            ));
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { message = "Invalid or expired refresh token" });
        }
    }

    private string GenerateOtpCode()
    {
        return _random.Next(100000, 999999).ToString();
    }

    private static string MaskDestination(string destination, OtpChannel channel)
    {
        if (channel == OtpChannel.Email)
        {
            var parts = destination.Split('@');
            if (parts.Length == 2)
            {
                var name = parts[0];
                var masked = name.Length > 2 
                    ? name[..2] + new string('*', Math.Min(name.Length - 2, 5)) 
                    : name;
                return $"{masked}@{parts[1]}";
            }
        }
        else if (channel == OtpChannel.Sms && destination.Length > 4)
        {
            return new string('*', destination.Length - 4) + destination[^4..];
        }
        
        return destination;
    }
}
