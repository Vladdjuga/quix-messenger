using Application.Common;
using Application.DTOs;
using MediatR;

namespace Application.UseCases.Chats.UploadChatAvatar;

public record UploadChatAvatarCommand(FileDto File, Guid ChatId, Guid InitiatorUserId) : IRequest<Result<string>>;
