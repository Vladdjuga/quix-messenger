using Application.Common;
using Application.DTOs;
using Application.DTOs.Message;
using Application.Interfaces;
using Application.Interfaces.Notification;
using Application.UseCases.Attachments;
using Application.UseCases.Messages.Commands;
using Application.UseCases.Messages.Queries;
using Infrastructure.Services;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using UI.Attributes;
using UI.Common;
using UI.Utilities;

namespace UI.Controllers.Data;

[Route("api/[controller]")]
public class MessagesController : Controller
{
    private readonly IMediator _mediator;
    private readonly ILogger _logger;

    public MessagesController(
        IMediator mediator, 
        ILogger<MessagesController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    // POST api/messages
    [Authorize]
    [GetUserGuid]
    [HttpPost]
    public async Task<Results<Ok<ReadMessageDto>, BadRequest<ErrorResponse>>> Create(
        [FromForm] string text,
        [FromForm] Guid chatId,
        [FromForm] IFormFileCollection? attachments)
    {
        var userId = HttpContext.GetUserGuid();
        
        // Convert IFormFile to FileStreamDto
        var fileDtos = attachments?
            .Where(file => file.Length > 0)
            .Select(file => new FileStreamDto
            {
                Name = file.FileName,
                ContentType = file.ContentType,
                Content = file.OpenReadStream()
            }).ToList();

        _logger.LogInformation(
            "User {UserId} sending message to chat {ChatId} with {AttachmentCount} attachments",
            userId, chatId, fileDtos?.Count ?? 0);

        // Single command handles everything: save message, upload files, publish event
        var command = new CreateMessageCommand(text, userId, chatId, fileDtos);
        var result = await _mediator.Send(command);
        
        if (result.IsFailure)
        {
            _logger.LogError(
                "Failed to send message by user {UserId} to chat {ChatId}: {Error}",
                userId, chatId, result.Error);
            return ErrorResult.Create(result.Error);
        }

        _logger.LogInformation(
            "User {UserId} sent message {MessageId} to chat {ChatId}",
            userId, result.Value.Id, chatId);

        return TypedResults.Ok(result.Value);
    }

    // GET api/messages?chatId=&userId=&count=
    [Authorize]
    [GetUserGuid]
    [HttpGet]
    public async Task<Results<Ok<IEnumerable<ReadMessageDto>>, BadRequest<ErrorResponse>>> Get(
        [FromQuery] Guid chatId,
        [FromQuery] int count = 50)
    {
        var userId = HttpContext.GetUserGuid();
        var query = new GetMessagesQuery(chatId, userId, count);
        _logger.LogInformation("Fetching messages chatId={ChatId} userId={UserId} count={Count}", chatId, userId, count);
        var result = await _mediator.Send(query);
        if (result.IsFailure)
        {
            _logger.LogError("Failed to fetch messages: {Error}", result.Error);
            return ErrorResult.Create(result.Error);
        }
        return TypedResults.Ok(result.Value);
    }

    // GET api/messages/paginated?chatId=&userId=&lastCreatedAt=&pageSize=
    [Authorize]
    [GetUserGuid]
    [HttpGet("paginated")]
    public async Task<Results<Ok<IEnumerable<ReadMessageDto>>, BadRequest<ErrorResponse>>> GetPaginated(
        [FromQuery] Guid chatId,
        [FromQuery] DateTime lastCreatedAt,
        [FromQuery] int pageSize = 50)
    {
        var userId = HttpContext.GetUserGuid();
        var query = new GetMessagesPaginatedQuery(chatId, userId, lastCreatedAt, pageSize);
        _logger.LogInformation("Fetching paginated messages chatId={ChatId} userId={UserId} lastCreatedAt={LastCreatedAt} pageSize={PageSize}", chatId, userId, lastCreatedAt, pageSize);
        var result = await _mediator.Send(query);
        if (result.IsFailure)
        {
            _logger.LogError("Failed to fetch paginated messages: {Error}", result.Error);
            return ErrorResult.Create(result.Error);
        }
        return TypedResults.Ok(result.Value);
    }

    // GET api/messages/last?chatId=&count=
    [Authorize]
    [GetUserGuid]
    [HttpGet("last")]
    public async Task<Results<Ok<IEnumerable<ReadMessageDto>>, BadRequest<ErrorResponse>>> GetLast(
        [FromQuery] Guid chatId,
        [FromQuery] int count = 50)
    {
        var userId = HttpContext.GetUserGuid();
        var query = new GetMessagesQuery(chatId, userId, count);
        _logger.LogInformation("Fetching last messages chatId={ChatId} userId={UserId} count={Count}", chatId, userId, count);
        var result = await _mediator.Send(query);
        if (result.IsFailure)
        {
            _logger.LogError("Failed to fetch last messages: {Error}", result.Error);
            return ErrorResult.Create(result.Error);
        }
        return TypedResults.Ok(result.Value);
    }

    // PATCH api/messages/{messageId}
    [Authorize]
    [GetUserGuid]
    [HttpPatch("{messageId:guid}")]
    public async Task<Results<Ok, BadRequest<ErrorResponse>>> Edit([FromRoute] Guid messageId, [FromBody] EditMessageDto dto)
    {
        var userId = HttpContext.GetUserGuid();
        var command = new EditMessageCommand(messageId, userId, dto.Text);
        _logger.LogInformation("User {UserId} requests edit of message {MessageId}", userId, messageId);
        var result = await _mediator.Send(command);
        if (result.IsFailure)
        {
            _logger.LogError("Failed to edit message {MessageId}: {Error}", messageId, result.Error);
            return ErrorResult.Create(result.Error);
        }
        return TypedResults.Ok();
    }

    // DELETE api/messages/{messageId}
    [Authorize]
    [GetUserGuid]
    [HttpDelete("{messageId:guid}")]
    public async Task<Results<Ok, BadRequest<ErrorResponse>>> Delete([FromRoute] Guid messageId)
    {
        var userId = HttpContext.GetUserGuid();
        var command = new DeleteMessageCommand(messageId, userId);
        _logger.LogInformation("User {UserId} requests deletion of message {MessageId}", userId, messageId);
        var result = await _mediator.Send(command);
        if (result.IsFailure)
        {
            _logger.LogError("Failed to delete message {MessageId}: {Error}", messageId, result.Error);
            return ErrorResult.Create(result.Error);
        }
        return TypedResults.Ok();
    }
}

