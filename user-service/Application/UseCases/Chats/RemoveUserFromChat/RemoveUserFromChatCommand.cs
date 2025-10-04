using Application.Common;
using MediatR;

namespace Application.UseCases.Chats.RemoveUserFromChat;

public record RemoveUserFromChatCommand(Guid ChatId, Guid UserId, Guid InitiatorUserId) : IRequest<IResult>;
