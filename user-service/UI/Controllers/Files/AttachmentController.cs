using Application.Common;
using Application.DTOs;
using Application.DTOs.Message;
using Application.UseCases.Attachments;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Security.Claims;
using UI.Attributes;
using UI.Common;
using UI.Utilities;

namespace UI.Controllers.Files;

[Route("api/[controller]")]
public class AttachmentController : Controller
{
    private readonly IMediator _mediator;
    private readonly ILogger _logger;

    public AttachmentController(IMediator mediator, ILogger<AttachmentController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Upload one or more attachments to a message
    /// </summary>
    /// <returns>List of attachment metadata DTOs</returns>
    [Authorize]
    [HttpPost("upload")]
    public async Task<Results<
            UnauthorizedHttpResult,
            BadRequest<ErrorResponse>,
            Ok<List<MessageAttachmentDto>>
        >> UploadAttachments(
        [FromForm] Guid messageId,
        [FromForm] Guid chatId,
        [FromForm] List<IFormFile>? files)
    {
        if (files == null || files.Count == 0)
        {
            _logger.LogWarning("No files provided for upload to message {MessageId} in chat {ChatId}", messageId, chatId);
            return ErrorResult.Create("No files provided for upload.");
        }

        var fileDtos = files.Where(file => file.Length > 0)
            .Select(file => new FileStreamDto
            {
                Name = file.FileName,
                ContentType = file.ContentType,
                Content = file.OpenReadStream()
            }).ToList();

        var command = new UploadAttachmentsCommand(messageId, chatId, fileDtos);
        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            _logger.LogError("Failed to upload attachments to message {MessageId} in chat {ChatId}: {Error}",
                messageId, chatId, result.Error);
            return ErrorResult.Create(result.Error);
        }

        _logger.LogInformation("Successfully uploaded {FileCount} attachments to message {MessageId} in chat {ChatId}",
            result.Value.Count, messageId, chatId);
        return TypedResults.Ok(result.Value);
    }

    /// <summary>
    /// Get attachment metadata for a message
    /// </summary>
    /// <returns>List of attachment metadata DTOs</returns>
    [Authorize]
    [HttpGet("message/{messageId:guid}")]
    public async Task<Results<
            UnauthorizedHttpResult,
            BadRequest<ErrorResponse>,
            Ok<IEnumerable<MessageAttachmentDto>>
        >> GetAttachments(Guid messageId)
    {
        var query = new GetAttachmentsCommand(messageId);
        var result = await _mediator.Send(query);

        if (result.IsFailure)
        {
            _logger.LogError("Failed to retrieve attachments for message {MessageId}: {Error}",
                messageId, result.Error);
            return ErrorResult.Create(result.Error);
        }

        _logger.LogInformation("Successfully retrieved {FileCount} attachments for message {MessageId}",
            result.Value.Count(), messageId);
        return TypedResults.Ok(result.Value);
    }

    /// <summary>
    /// Download a specific attachment file
    /// </summary>
    /// <returns>File stream with range support</returns>
    [Authorize]
    [GetUserGuid]
    [HttpGet("download/{attachmentId:guid}")]
    public async Task<Results<
            FileStreamHttpResult,
            NotFound,
            UnauthorizedHttpResult,
            BadRequest<ErrorResponse>
        >
    > DownloadAttachment(Guid attachmentId)
    {
        var userId = HttpContext.GetUserGuid();
        var query = new DownloadAttachmentQuery(attachmentId, userId);
        var result = await _mediator.Send(query);

        if (result.IsFailure)
        {
            _logger.LogError("Failed to download attachment {AttachmentId}: {Error}",
                attachmentId, result.Error);
            return ErrorResult.Create(result.Error);
        }

        var file = result.Value;
        _logger.LogInformation("Successfully serving attachment {AttachmentId} ({FileName})",
            attachmentId, file.Name);

        // Use File() with stream for proper HTTP range support and async streaming
        return TypedResults.File(file.Content, file.ContentType, file.Name, enableRangeProcessing: true);
    }
}