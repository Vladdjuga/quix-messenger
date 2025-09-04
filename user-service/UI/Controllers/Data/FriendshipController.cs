using System.IdentityModel.Tokens.Jwt;
using Application.Common;
using Application.DTOs.Friendship;
using Application.UseCases.Friendships.AcceptFriendship;
using Application.UseCases.Friendships.ChangeFriendshipStatus;
using Application.UseCases.Friendships.CreateFriendship;
using Application.UseCases.Friendships.RequestFriendship;
using Application.UseCases.Friendships.CreateFriendshipByUsername;
using Application.UseCases.Friendships.GetFriendship;
using Application.UseCases.Friendships.GetUsersFriendships;
using Application.UseCases.Friendships.SearchIncomingFriendRequests;
using Application.UseCases.Friendships.SearchUsersFriendships;
using Application.Utilities;
using AutoMapper;
using Domain.Enums;
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

[Route("api/[controller]")]
public class FriendshipController:Controller
{
    private readonly IMediator _mediator;
    private readonly ILogger _logger;

    public FriendshipController(IMediator mediator, ILogger<FriendshipController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    [Authorize]
    [GetUserGuid]
    [HttpPost("acceptFriendship/{friendshipId:guid}")]
    public async Task<Results<Ok<ReadFriendshipDto>,BadRequest<ErrorResponse>,
        UnauthorizedHttpResult>> AcceptFriendship(
        Guid friendshipId)
    {
        var userGuid = HttpContext.GetUserGuid();
        
        var command = new AcceptFriendshipCommand(userGuid, friendshipId);
        _logger.LogInformation("Accepting friendship {FriendshipId}", friendshipId);
        var result = await _mediator.Send(command);
        if (result.IsFailure)
        {
            _logger.LogError("Failed to accept friendship for {UserId} and {FriendshipId}",
                userGuid, friendshipId);
            _logger.LogError("Error: {Error}", result.Error);
            return ErrorResult.Create(result.Error);
        }
        _logger.LogInformation("Accepted friendship {FriendshipId}", friendshipId);
        return TypedResults.Ok(result.Value);
    }
    [Authorize]
    [GetUserGuid]
    [HttpGet("getFriendship/{friendshipId:guid}")]
    public async Task<Results<Ok<ReadFriendshipDto>,BadRequest<ErrorResponse>,UnauthorizedHttpResult>> GetFriendshipById(
        Guid friendshipId)
    {
        var userGuid = HttpContext.GetUserGuid();
        
        var query=new GetFriendshipQuery(userGuid,friendshipId);
        _logger.LogInformation("Getting friendship {FriendshipId}", friendshipId);
        var result = await _mediator.Send(query);
        if (result.IsFailure)
        {
            _logger.LogError("Error getting friendship {FriendshipId}", friendshipId);
            _logger.LogError("Error: {Error}", result.Error);
            return ErrorResult.Create(result.Error);
        }
        _logger.LogInformation("Retrieved friendship {FriendshipId}", friendshipId);
        return TypedResults.Ok(result.Value);
    }
    [Authorize]
    [GetUserGuid]
    [HttpGet("getFriendships")]
    public async Task<Results<Ok<IEnumerable<ReadFriendshipDto>>, 
        BadRequest<ErrorResponse>,UnauthorizedHttpResult>> GetFriendships(
        [FromQuery] int? pageSize,
        [FromQuery] DateTime? lastCreatedAt)
    {
        var userGuid = HttpContext.GetUserGuid();
        
        // If pageSize is not provided, return all friendships (legacy behavior); otherwise, return paged results
        var query = pageSize.HasValue
            ? new GetUsersFriendshipsQuery(userGuid, lastCreatedAt, pageSize.Value)
            : new GetUsersFriendshipsQuery(userGuid);
        _logger.LogInformation("Getting friendships for {UserId}", userGuid);
        var result = await _mediator.Send(query);
        if (result.IsFailure)
        {
            _logger.LogError("Error getting friendships for {UserId}", userGuid);
            _logger.LogError("Error: {Error}", result.Error);
            return ErrorResult.Create(result.Error);
        }
        _logger.LogInformation("Retrieved friendships for {UserId}", userGuid);
        return TypedResults.Ok(result.Value);
    }

    [Authorize]
    [GetUserGuid]
    [HttpGet("searchFriendships")]
    public async Task<Results<Ok<IEnumerable<ReadFriendshipDto>>, 
        BadRequest<ErrorResponse>,UnauthorizedHttpResult>> SearchFriendships(
        [FromQuery] string query,
    [FromQuery] int? pageSize,
        [FromQuery] DateTime? lastCreatedAt)
    {
        var userGuid = HttpContext.GetUserGuid();
    var size = (pageSize.HasValue && pageSize.Value > 0) ? Math.Min(pageSize.Value, 100) : 20;

        // When query is empty or whitespace, fall back to the regular paginated friendships list
        if (string.IsNullOrWhiteSpace(query))
        {
            var getFriendshipsQuery = new GetUsersFriendshipsQuery(userGuid, lastCreatedAt, size);
            _logger.LogInformation("Query empty. Returning paged friendships for {UserId}", userGuid);
            var friendshipsResult = await _mediator.Send(getFriendshipsQuery);
            if (friendshipsResult.IsFailure)
            {
                _logger.LogError("Error getting paged friendships for {UserId}", userGuid);
                _logger.LogError("Error: {Error}", friendshipsResult.Error);
                return ErrorResult.Create(friendshipsResult.Error);
            }
            _logger.LogInformation("Retrieved paged friendships for {UserId}", userGuid);
            return TypedResults.Ok(friendshipsResult.Value);
        }

        var q = new SearchUsersFriendshipsQuery(
            userGuid,
            query,
            FriendshipStatus.Active, // Only search active friendships
            lastCreatedAt,
            size);
        _logger.LogInformation("Searching friendships for {UserId}", userGuid);
        var result = await _mediator.Send(q);
        if (result.IsFailure)
        {
            _logger.LogError("Error searching friendships for {UserId}", userGuid);
            _logger.LogError("Error: {Error}", result.Error);
            return ErrorResult.Create(result.Error);
        }
        _logger.LogInformation("Retrieved searched friendships for {UserId}", userGuid);
        return TypedResults.Ok(result.Value);
    }
    
    [Authorize]
    [GetUserGuid]
    [HttpGet("getFriendRequests")]
    public async Task<Results<Ok<IEnumerable<ReadFriendshipDto>>, 
        BadRequest<ErrorResponse>,UnauthorizedHttpResult>> GetUsersFriendRequests(
        [FromQuery] string query,
        [FromQuery] int pageSize,
        [FromQuery] DateTime? lastCreatedAt)
    {
        var userGuid = HttpContext.GetUserGuid();

        var q = new SearchIncomingFriendRequestsQuery(
            userGuid,
            query,
            lastCreatedAt,
            pageSize);
        _logger.LogInformation("Searching incoming friend requests for {UserId}", userGuid);
        var result = await _mediator.Send(q);
        if (result.IsFailure)
        {
            _logger.LogError("Error searching incoming friend requests for {UserId}", userGuid);
            _logger.LogError("Error: {Error}", result.Error);
            return ErrorResult.Create(result.Error);
        }
        _logger.LogInformation("Retrieved incoming friend requests for {UserId}", userGuid);
        return TypedResults.Ok(result.Value);
    }

    [Authorize]
    [GetUserGuid]
    [HttpPatch("changeFriendshipStatus/{friendshipId:guid}/{status}")]
    public async Task<Results<Ok, BadRequest<ErrorResponse>,
        UnauthorizedHttpResult>> ChangeFriendshipStatus(Guid friendshipId,
        FriendshipStatus status)
    {
        var userGuid = HttpContext.GetUserGuid();
        
        var command = new ChangeFriendshipStatusCommand(
            userGuid,
            friendshipId,
            status
        );
        _logger.LogInformation("Changing friendship status to {TargetStatus}", status);
        var result = await _mediator.Send(command);
        if (result.IsFailure)
        {
            _logger.LogError("Error changing status for friendship : {FriendshipId}", friendshipId);
            _logger.LogError("Error: {Error}", result.Error);
            return ErrorResult.Create(result.Error);
        }
        _logger.LogInformation("Successfully changed friendship status to {TargetStatus}", status);
        return TypedResults.Ok();
    }
    [Authorize]
    [GetUserGuid]
    [HttpPost("requestFriendship/{username}")]
    public async Task<Results<Ok<ReadFriendshipDto>,BadRequest<ErrorResponse>,
        UnauthorizedHttpResult>> RequestFriendship(
        string username
        )
    {
        var userGuid = HttpContext.GetUserGuid();

        _logger.LogInformation("Requesting friendship by username {Username}", username);
        var command = new RequestFriendshipCommand(userGuid, username);
        var result = await _mediator.Send(command);
        if (result.IsFailure)
        {
            _logger.LogError("Failed to request friendship for {Username}", username);
            _logger.LogError("Error: {Error}", result.Error);
            return ErrorResult.Create(result.Error);
        }
        _logger.LogInformation("Friendship request created for {Username}", username);
        return TypedResults.Ok(result.Value);
    }
}