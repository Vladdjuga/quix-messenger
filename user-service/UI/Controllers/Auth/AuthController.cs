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
    public async Task<Results<Ok<string>, BadRequest<string>>> Login([FromBody] LoginUserDto loginDto)
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
            return TypedResults.BadRequest(result.Error);
        }
        var dto=result.Value;
        _logger.LogInformation("Login User: {Identity}", loginDto.Identity);
        _logger.LogInformation("Tokens generated for user - {Identity}.", loginDto.Identity);
        // Here store the refresh token in cookies 
        Response.Cookies.Append("refreshToken", dto.RefreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = false,
            SameSite = SameSiteMode.Strict,
            Expires = dto.ExpiresAt,
        });
        return TypedResults.Ok(dto.AccessToken);
    }

    /// <summary>
    /// This method will register a user.
    /// </summary>
    /// <param name="registerDto">This is a registration information.</param>
    /// <returns>Will return a newly added users Guid key or bad request if the exception was thrown.</returns>
    [HttpPost("register")]
    public async Task<Results<Ok<Guid>, BadRequest<string>>> Register([FromBody] RegisterUserDto registerDto)
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
            return TypedResults.BadRequest(result.Error);
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
    [HttpPost("logout")]
    public async Task<Results<Ok, BadRequest<string>>> Logout()
    {
        _logger.LogInformation("Trying to gather Session from user claims to refresh token.");
        var sessionId = User.Claims.FirstOrDefault(c => c.Type == JwtCustomClaimNames.Session)?.Value;
        if (string.IsNullOrEmpty(sessionId))
        {
            _logger.LogError("Session ID is missing in user claims. Possibly the user is not logged in or the session has expired.");
            return TypedResults.BadRequest("Session ID is missing in user claims.");
        }
        if (!Guid.TryParse(sessionId, out var sessionGuid))
        {
            _logger.LogError("Session ID is not a valid GUID.");
            return TypedResults.BadRequest("Session ID is not a valid GUID.");
        }
        _logger.LogInformation("Starting to logout user.");
        var command = new InvalidateTokenCommand(
            sessionGuid
        );
        _logger.LogInformation("Invalidating session with ID: {SessionId}", sessionGuid);
        var result = await _mediator.Send(command);
        if (result.IsFailure)
        {
            _logger.LogError("Failure while logging out user. Error: {Error}", result.Error);
            return TypedResults.BadRequest(result.Error);
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
    [Authorize]
    [HttpPost("refresh")]
    public async Task<Results<Ok<string>, BadRequest<string>>> RefreshToken()
    {
        _logger.LogInformation("Starting to refresh token.");
        var refreshToken = Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(refreshToken))
        {
            _logger.LogError("Refresh token is missing.");
            return TypedResults.BadRequest("Refresh token is missing.");
        }
        _logger.LogInformation("Trying to gather Session from user claims to refresh token.");
        var sessionId = User.Claims.FirstOrDefault(c => c.Type == JwtCustomClaimNames.Session)?.Value;
        if (string.IsNullOrEmpty(sessionId))
        {
            _logger.LogError("Session ID is missing in user claims. Possibly the user is not logged in or the session has expired.");
            return TypedResults.BadRequest("Session ID is missing in user claims.");
        }
        if (!Guid.TryParse(sessionId, out var sessionGuid))
        {
            _logger.LogError("Session ID is not a valid GUID.");
            return TypedResults.BadRequest("Session ID is not a valid GUID.");
        }
        var command = new RefreshTokenCommand(refreshToken,sessionGuid);
        var result = await _mediator.Send(command);
        if (result.IsFailure)
        {
            _logger.LogError("Failure while refreshing token. Error: {Error}", result.Error);
            return TypedResults.BadRequest(result.Error);
        }
        
        var dto = result.Value;
        _logger.LogInformation("Token refreshed successfully. For session ID: {SessionId}", sessionGuid);
        
        // Here store the new refresh token in cookies
        Response.Cookies.Append("refreshToken", dto.RefreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = false,
            SameSite = SameSiteMode.Strict,
            Expires = dto.ExpiresAt,
            
        });
        
        return TypedResults.Ok(dto.AccessToken);
    }
}