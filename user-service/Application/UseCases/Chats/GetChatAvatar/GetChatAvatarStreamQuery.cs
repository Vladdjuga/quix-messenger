using Application.Common;
using Application.DTOs;
using MediatR;

namespace Application.UseCases.Chats.GetChatAvatar;

/// <summary>
/// Query to get chat avatar using stream (memory-efficient)
/// </summary>
public record GetChatAvatarStreamQuery(Guid ChatId) : IRequest<Result<FileStreamDto?>>;
