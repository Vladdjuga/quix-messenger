using Application.Common;
using Application.DTOs;
using MediatR;

namespace Application.UseCases.Chats.GetChatAvatar;

public record GetChatAvatarQuery(Guid ChatId) : IRequest<Result<FileDto?>>;
