using Application.Common;
using MediatR;

namespace Application.UseCases.Chats.UpdateChat;

public record UpdateChatCommand(Guid ChatId, Guid InitiatorUserId, string Title) : IRequest<IResult>;
