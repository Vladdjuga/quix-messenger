using Application.Common;
using Application.DTOs.Message;
using Application.UseCases.Messages.Commands;
using Application.UseCases.Messages.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
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

    public MessagesController(IMediator mediator, ILogger<MessagesController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    // POST api/messages
    [Authorize]
    [GetUserGuid]
    [HttpPost]
    public async Task<Results<Ok<Guid>, BadRequest<ErrorResponse>, UnauthorizedHttpResult>> Create([FromBody] CreateMessageDto dto)
    {
        var userId = HttpContext.GetUserGuid();
        var command = new CreateMessageCommand(dto.Text, userId, dto.ChatId, dto.SentAt);
        _logger.LogInformation("User {UserId} sending message to chat {ChatId}", userId, dto.ChatId);
        var result = await _mediator.Send(command);
        if (result.IsFailure)
        {
            _logger.LogError("Failed to send message by user {UserId} to chat {ChatId}: {Error}", userId, dto.ChatId, result.Error);
            return ErrorResult.Create(result.Error);
        }
        _logger.LogInformation("User {UserId} sent message {MessageId} to chat {ChatId}", userId, result.Value, dto.ChatId);
        return TypedResults.Ok(result.Value);
    }

    // GET api/messages?chatId=&userId=&count=
    [Authorize]
    [GetUserGuid]
    [HttpGet]
    public async Task<Results<Ok<IEnumerable<ReadMessageDto>>, BadRequest<ErrorResponse>, UnauthorizedHttpResult>> Get(
        [FromQuery] Guid? chatId,
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
    public async Task<Results<Ok<IEnumerable<ReadMessageDto>>, BadRequest<ErrorResponse>, UnauthorizedHttpResult>> GetPaginated(
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
}

public class CreateMessageDto
{
    public required string Text { get; set; }
    public required Guid ChatId { get; set; }
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
}
