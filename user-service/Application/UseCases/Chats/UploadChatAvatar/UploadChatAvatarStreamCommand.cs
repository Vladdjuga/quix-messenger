using Application.Common;
using Application.DTOs;
using MediatR;

namespace Application.UseCases.Chats.UploadChatAvatar;

/// <summary>
/// Command to upload chat avatar using stream (memory-efficient)
/// </summary>
public record UploadChatAvatarStreamCommand(
    FileStreamDto File,
    Guid ChatId,
    Guid InitiatorUserId
) : IRequest<Result<string>>;
