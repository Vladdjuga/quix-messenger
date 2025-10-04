using System.IdentityModel.Tokens.Jwt;
using Application.Common;
using Application.DTOs.Chat;
using Application.UseCases.Chats.AddUserToChat;
using Application.UseCases.Chats.AnyChatById;
using Application.UseCases.Chats.CreateChat;
using Application.UseCases.Chats.GetChats;
using Application.UseCases.Chats.GetChatParticipants;
using Application.UseCases.Chats.RemoveUserFromChat;
using Application.UseCases.Chats.UpdateChat;
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

    [GetUserGuid]
    [Authorize]
    [HttpPost("addUserToChat")]
    public async Task<Results<Ok, BadRequest<ErrorResponse>>> AddUserToChat([FromBody] AddUserToChatDto addUserToChatDto)
    {
        var userGuid = HttpContext.GetUserGuid();
        
        var command = new AddUserToChatCommand(
            addUserToChatDto.ChatId,
            addUserToChatDto.UserId,
            userGuid,
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

    [Authorize]
    [HttpGet("isUserInChat")]
    public async Task<Results<Ok<ChatMembershipResponse>, BadRequest<ErrorResponse>, UnauthorizedHttpResult>> IsUserInChat(
        [FromQuery] Guid userId, 
        [FromQuery] Guid chatId)
    {
        var query = new AnyChatByIdQuery(userId, chatId);
        _logger.LogInformation("Checking if user {UserId} is in chat {ChatId}", userId, chatId);
        
        var result = await _mediator.Send(query);
        if (result.IsFailure)
        {
            _logger.LogError("Error checking if user {UserId} is in chat {ChatId}: {Error}", 
                userId, chatId, result.Error);
            return ErrorResult.Create(result.Error);
        }
        
        _logger.LogInformation("User {UserId} membership in chat {ChatId}: {IsInChat}", 
            userId, chatId, result.Value);
        
        return TypedResults.Ok(new ChatMembershipResponse(result.Value));
    }

    [GetUserGuid]
    [Authorize]
    [HttpPatch("updateChat")]
    public async Task<Results<Ok, BadRequest<ErrorResponse>>> UpdateChat([FromBody] UpdateChatDto updateChatDto)
    {
        var userGuid = HttpContext.GetUserGuid();
        
        var command = new UpdateChatCommand(
            updateChatDto.ChatId,
            userGuid,
            updateChatDto.Title
        );
        
        _logger.LogInformation("User {UserId} updating chat {ChatId}", userGuid, updateChatDto.ChatId);
        var result = await _mediator.Send(command);
        
        if (result.IsFailure)
        {
            _logger.LogError("Failed to update chat {ChatId}: {Error}", updateChatDto.ChatId, result.Error);
            return ErrorResult.Create(result.Error);
        }
        
        _logger.LogInformation("Chat {ChatId} updated successfully", updateChatDto.ChatId);
        return TypedResults.Ok();
    }

    [GetUserGuid]
    [Authorize]
    [HttpPost("removeUserFromChat")]
    public async Task<Results<Ok, BadRequest<ErrorResponse>>> RemoveUserFromChat([FromBody] RemoveUserFromChatDto dto)
    {
        var userGuid = HttpContext.GetUserGuid();
        
        var command = new RemoveUserFromChatCommand(
            dto.ChatId,
            dto.UserId,
            userGuid
        );
        
        _logger.LogInformation("User {InitiatorId} removing user {UserId} from chat {ChatId}", 
            userGuid, dto.UserId, dto.ChatId);
        var result = await _mediator.Send(command);
        
        if (result.IsFailure)
        {
            _logger.LogError("Failed to remove user {UserId} from chat {ChatId}: {Error}", 
                dto.UserId, dto.ChatId, result.Error);
            return ErrorResult.Create(result.Error);
        }
        
        _logger.LogInformation("User {UserId} removed from chat {ChatId} successfully", 
            dto.UserId, dto.ChatId);
        return TypedResults.Ok();
    }

    [GetUserGuid]
    [Authorize]
    [HttpGet("getChatParticipants")]
    public async Task<Results<Ok<IEnumerable<ChatParticipantDto>>, BadRequest<ErrorResponse>>> GetChatParticipants(
        [FromQuery] Guid chatId)
    {
        var userGuid = HttpContext.GetUserGuid();
        
        var query = new GetChatParticipantsQuery(chatId, userGuid);
        
        _logger.LogInformation("User {UserId} getting participants for chat {ChatId}", userGuid, chatId);
        var result = await _mediator.Send(query);
        
        if (result.IsFailure)
        {
            _logger.LogError("Failed to get participants for chat {ChatId}: {Error}", chatId, result.Error);
            return ErrorResult.Create(result.Error);
        }
        
        _logger.LogInformation("Retrieved participants for chat {ChatId}", chatId);
        return TypedResults.Ok(result.Value);
    }
    
}