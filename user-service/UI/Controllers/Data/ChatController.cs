using System.IdentityModel.Tokens.Jwt;
using Application.Common;
using Application.DTOs.Chat;
using Application.UseCases.Chats.AddUserToChat;
using Application.UseCases.Chats.CreateChat;
using Application.UseCases.Chats.GetChats;
using Application.Utilities;
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
public class ChatController:Controller
{
    private readonly IMediator _mediator;
    private readonly ILogger _logger;

    public ChatController(IMediator mediator, ILogger<ChatController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    [Authorize]
    [GetUserGuid]
    [HttpGet("getChats")]
    public async Task<Results<Ok<IEnumerable<ReadChatDto>>,
        BadRequest<ErrorResponse>,UnauthorizedHttpResult>> GetChats()
    {
        var userId = HttpContext.GetUserGuid();

        var query = new GetChatsByUserIdQuery(userId);
        _logger.LogInformation("User {Username} tries to get chats", userId);
        var result = await _mediator.Send(query);
        if (result.IsFailure)
        {
            _logger.LogError("User {Username} failed to get chats", userId);
            _logger.LogError("Error : {Message}", result.Error);
            return ErrorResult.Create(result.Error);
        }
        _logger.LogInformation("User {Username} gets the chats", userId);
        return TypedResults.Ok(result.Value);
    }

    [Authorize]
    [GetUserGuid]
    [HttpPost("addChat")]
    public async Task<Results<Ok<ReadChatDto>,BadRequest<ErrorResponse>,NotFound<string>,UnauthorizedHttpResult>> AddChat([FromBody] CreateChatDto createChatDto)
    {
        var userGuid = HttpContext.GetUserGuid();
        
        var command = new CreateChatCommand(
            createChatDto.Title,
            createChatDto.ChatType,
            userGuid
        );
        _logger.LogInformation("User {UserId} tries to create chat", userGuid);
        var result = await _mediator.Send(command);
        if (result.IsFailure)
        {
            _logger.LogError("User {Username} failed to create chat", userGuid);
            _logger.LogError("Error : {Message}", result.Error);
            return ErrorResult.Create(result.Error);
        }
        _logger.LogInformation("User {Username} added chat", userGuid);
        return TypedResults.Ok(result.Value);
    }

    [Authorize]
    [HttpPost("addUserToChat")]
    public async Task<Results<Ok, BadRequest<ErrorResponse>>> AddUserToChat([FromBody] AddUserToChatDto addUserToChatDto)
    {
        var command = new AddUserToChatCommand(
            addUserToChatDto.ChatId,
            addUserToChatDto.UserId,
            addUserToChatDto.ChatRole
        );
        _logger.LogInformation("Adding user {UserId} to chat {ChatId}",
            addUserToChatDto.UserId, addUserToChatDto.ChatId);
        var result = await _mediator.Send(command);
        if (result.IsFailure)
        {
            _logger.LogError("Error while adding user {UserId} to chat {ChatId}",
                addUserToChatDto.UserId, addUserToChatDto.ChatId);
            _logger.LogError("Error : {Message}", result.Error);
            return ErrorResult.Create(result.Error);
        }
        _logger.LogInformation("Added user {UserId} to chat {ChatId}",
            addUserToChatDto.UserId, addUserToChatDto.ChatId);
        return TypedResults.Ok();
    } 
    
}