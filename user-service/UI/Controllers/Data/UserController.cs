using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Application.Common;
using Application.DTOs.User;
using Application.Interfaces.DTOs;
using Application.UseCases.Users.Data;
using Application.UseCases.Users.Data.GetUser;
using Application.UseCases.Users.Data.UpdateUser;
using Application.UseCases.Users.SearchUsers;
using Application.Utilities;
using AutoMapper;
using Domain.Repositories;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using UI.Attributes;
using UI.Utilities;
using UI.Common;

namespace UI.Controllers.Data;

/// <summary>
/// This is a REST controller that will mainly manage user data.
/// Changing and reading user data will happen here.
/// </summary>
[Route("api/[controller]")]
public class UserController : Controller
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;
    private readonly IMediator _mediator;
    private readonly ILogger _logger;

    public UserController(IUserRepository userRepository, IMapper mapper, IMediator mediator,
        ILogger<UserController> logger)
    {
        _userRepository = userRepository;
        _mapper = mapper;
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// This method will get info about 1 user only, finding them by username.
    /// </summary>
    /// <param name="username">The username string that will be passed by the client.</param>
    /// <returns>
    /// IReadUserDto or Bad Request if the exception was thrown or user was not found.
    /// The IReadUserDto instance can be either ReadUserDto or ReadUserPublicDto.
    /// If the JWT authorizing token is user`s then it will return ReadUserDto if not ReadUserPublicDto.
    /// </returns>
    [Authorize]
    [GetUserGuid]
    [HttpGet("getUserInfo/{username}")]
    public async Task<Results<Ok<IReadUserDto>, UnauthorizedHttpResult, BadRequest<ErrorResponse>>> GetUserInfo(
        string username)
    {
        var userGuid = HttpContext.GetUserGuid();

        var query = new GetUserQuery(
            Username: username,
            UserGuid: userGuid
        );
        _logger.LogInformation("Starting to get user info for {Username}", username);
        var result = await _mediator.Send(query);
        if (result.IsFailure)
        {
            _logger.LogError("Failed to get user info for {Username}", username);
            _logger.LogError("Error: {Error}", result.Error);
            return ErrorResult.Create(result.Error);
        }

        _logger.LogInformation("User {Username} found", username);
        return TypedResults.Ok(result.Value);
    }

    /// <summary>
    /// This method will update a user in a PATCH manner, meaning it will only change what is new.
    /// </summary>
    /// <param name="userDto">This is a DTO where parameters that have to change will be passed. Alongside with the users ID</param>
    /// <returns>ReadUserDto or Bad Request if the exception was thrown.</returns>
    [Authorize]
    [GetUserGuid]
    [HttpPatch("updateUserInfo")]
    public async Task<Results<Ok<ReadUserDto>, BadRequest<ErrorResponse>>> UpdateUserInfo(
        UpdateUserDto userDto)
    {
        var userGuid = HttpContext.GetUserGuid();
        
        var command = new UpdateUserCommand(userDto, userGuid);
        _logger.LogInformation("Starting to update user info for {Username}", userDto.Username);
        var result = await _mediator.Send(command);
        if (result.IsFailure)
        {
            _logger.LogError("Failed to update user info for {Username}", userDto.Username);
            _logger.LogError("Error: {Error}", result.Error);
            return ErrorResult.Create(result.Error);
        }
        _logger.LogInformation("User {Username} updated", userDto.Username);
        return TypedResults.Ok(result.Value);
    }
    
    [Authorize]
    [GetUserGuid]
    [HttpGet("getMeInfo")]
    public async Task<Results<Ok<IReadUserDto>, UnauthorizedHttpResult, BadRequest<ErrorResponse>>> GetMeInfo()
    {
        var userGuid = HttpContext.GetUserGuid();

        var query = new GetUserQuery(
            Username: null,
            UserGuid: userGuid  
        );
        _logger.LogInformation("Starting to get user info for {Guid}", userGuid);
        var result = await _mediator.Send(query);
        if (result.IsFailure)
        {
            _logger.LogError("Failed to get user info for {Guid}", userGuid);
            _logger.LogError("Error: {Error}", result.Error);
            return ErrorResult.Create(result.Error);
        }

        _logger.LogInformation("User {Guid} found", userGuid);
        
        return TypedResults.Ok(result.Value);
    }

    /// <summary>
    /// Search for users by username. This is for finding new people to add as contacts.
    /// </summary>
    /// <param name="query">The search query (username partial match)</param>
    /// <param name="pageSize">Number of results to return</param>
    /// <param name="lastCreatedAt">Cursor for pagination</param>
    /// <returns>List of users matching the search criteria</returns>
    [Authorize]
    [GetUserGuid]
    [HttpGet("search")]
    public async Task<Results<Ok<IEnumerable<ReadUserDto>>, 
        BadRequest<ErrorResponse>, UnauthorizedHttpResult>> SearchUsers(
        [FromQuery] string query,
        [FromQuery] int pageSize = 20,
        [FromQuery] DateTime? lastCreatedAt = null)
    {
        var currentUserId = HttpContext.GetUserGuid();
        
        var searchQuery = new SearchUsersQuery(
            query.Trim(),
            lastCreatedAt,
            pageSize,
            currentUserId);
            
        _logger.LogInformation("Searching users with query: {Query}, pageSize: {PageSize}, excludeUserId: {ExcludeUserId}", 
            query, pageSize, currentUserId);
        var result = await _mediator.Send(searchQuery);
        
        if (result.IsFailure)
        {
            _logger.LogError("Failed to search users with query: {Query}", query);
            _logger.LogError("Error: {Error}", result.Error);
            return ErrorResult.Create(result.Error);
        }

        _logger.LogInformation("Found {Count} users for query: {Query} (excluding current user)", result.Value.Count(), query);
        return TypedResults.Ok(result.Value);
    }

}