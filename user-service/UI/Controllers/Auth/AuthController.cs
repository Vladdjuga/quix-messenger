using Application.Common;
using Application.DTOs.User;
using Application.UseCases.Users.Auth;
using Application.UseCases.Users.Auth.InvalidateToken;
using Application.UseCases.Users.Auth.Login;
using Application.UseCases.Users.Auth.RefreshToken;
using Application.UseCases.Users.Auth.Register;
using Application.Utilities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.IdentityModel.Tokens.Jwt;
using UI.Attributes;
using UI.Utilities;
using UI.Common;

namespace UI.Controllers.Auth;

/// <summary>
/// This is an authorizing controller.
/// </summary>
[Route("api/[controller]")]
public class AuthController : Controller
{
    private readonly IMediator _mediator;
    private readonly ILogger _logger;

    public AuthController(IMediator mediator, ILogger<AuthController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// This method will authorize the user to the application.
    /// </summary>
    /// <param name="loginDto">This is login information.</param>
    /// <returns>Will return a generated JWT token or bad request if the exception was thrown.</returns>
    [HttpPost("login")]
    public async Task<Results<Ok<string>, BadRequest<ErrorResponse>>> Login([FromBody] LoginUserDto loginDto)
    {
        var command = new LoginUserCommand(
            Identity: loginDto.Identity,
            Password: loginDto.Password
        );
        _logger.LogInformation("Starting to login User: {Identity}", loginDto.Identity);
        var result = await _mediator.Send(command);
        if (result.IsFailure)
        {
            _logger.LogError("Failure while login user {User}.", loginDto.Identity);
            _logger.LogError("Error: {Error}", result.Error);
            return ErrorResult.Create(result.Error);
        }
        var dto=result.Value;
        _logger.LogInformation("Login User: {Identity}", loginDto.Identity);
        _logger.LogInformation("Tokens generated for user - {Identity}.", loginDto.Identity);
        // Here store the refresh token in cookies 
        Response.Cookies.Append("refreshToken", dto.RefreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = false, // Set to true in production with HTTPS
            SameSite = SameSiteMode.Lax, // Changed from Strict to Lax for cross-origin requests
            Expires = dto.ExpiresAt,
            Path = "/", // Ensure cookie is available for all paths
        });
        _logger.LogInformation("Set refreshToken cookie with expiration: {ExpiresAt}", dto.ExpiresAt);
        return TypedResults.Ok(dto.AccessToken);
    }

    /// <summary>
    /// This method will register a user.
    /// </summary>
    /// <param name="registerDto">This is a registration information.</param>
    /// <returns>Will return a newly added users Guid key or bad request if the exception was thrown.</returns>
    [HttpPost("register")]
    public async Task<Results<Ok<Guid>, BadRequest<ErrorResponse>>> Register([FromBody] RegisterUserDto registerDto)
    {
        var command = new RegisterUserCommand(
            Username: registerDto.Username,
            Email: registerDto.Email,
            Password: registerDto.Password,
            FirstName: registerDto.FirstName,
            LastName: registerDto.LastName,
            DateOfBirth: registerDto.DateOfBirth
        );
        _logger.LogInformation("Starting to register user {Username} - {Email}",
            registerDto.Username, registerDto.Email);
        var result = await _mediator.Send(command);
        if (result.IsFailure)
        {
            _logger.LogError("Failure while registering user {Username} - {Email}", registerDto.Username, registerDto.Email);
            _logger.LogError("Error: {Error}", result.Error);
            return ErrorResult.Create(result.Error);
        }
        _logger.LogInformation("Registered User: {Username} - {Email}", registerDto.Username, registerDto.Email);
        return TypedResults.Ok(result.Value);
    }
    /// <summary>
    /// This method will logout the user from the application.
    /// </summary>
    /// <returns>
    /// Will return an Ok result if the user was logged out successfully or a BadRequest if there was an error.
    /// </returns>
    [Authorize]
    [GetSessionGuid]
    [HttpPost("logout")]
    public async Task<Results<Ok, BadRequest<ErrorResponse>>> Logout()
    {
        var sessionGuid = HttpContext.GetSessionGuid();
        
        _logger.LogInformation("Starting to logout user.");
        var command = new InvalidateTokenCommand(
            sessionGuid
        );
        _logger.LogInformation("Invalidating session with ID: {SessionId}", sessionGuid);
        var result = await _mediator.Send(command);
        if (result.IsFailure)
        {
            _logger.LogError("Failure while logging out user. Error: {Error}", result.Error);
            return ErrorResult.Create(result.Error);
        }
        Response.Cookies.Delete("refreshToken");
        _logger.LogInformation("User logged out successfully. Session ID: {SessionId}", sessionGuid);
        return TypedResults.Ok();
    }
    
    /// <summary>
    /// This method will refresh the JWT token using the refresh token stored in cookies.
    /// </summary>
    /// <returns>
    /// Will return a new JWT token if the refresh token is valid, or a BadRequest if there was an error.
    /// </returns>
    [HttpPost("refresh")]
    public async Task<Results<Ok<string>, BadRequest<ErrorResponse>>> RefreshToken()
    {
        _logger.LogInformation("Starting to refresh token.");
        
        // Debug: Log all cookies received
        _logger.LogInformation("Received cookies: {Cookies}", string.Join(", ", Request.Cookies.Select(c => $"{c.Key}={c.Value}")));
        
        var refreshToken = Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(refreshToken))
        {
            _logger.LogError("Refresh token is missing.");
            return ErrorResult.Create("Refresh token is missing.");
        }
        
        var command = new RefreshTokenCommand(refreshToken);
        var result = await _mediator.Send(command);
        if (result.IsFailure)
        {
            _logger.LogError("Failure while refreshing token. Error: {Error}", result.Error);
            return ErrorResult.Create(result.Error);
        }
        
        var dto = result.Value;
        _logger.LogInformation("Token refreshed successfully.");
        
        // Here store the new refresh token in cookies
        Response.Cookies.Append("refreshToken", dto.RefreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = false, // Set to true in production with HTTPS
            SameSite = SameSiteMode.Lax, // Changed from Strict to Lax for cross-origin requests
            Expires = dto.ExpiresAt,
            Path = "/", // Ensure cookie is available for all paths
        });
        
        return TypedResults.Ok(dto.AccessToken);
    }
}