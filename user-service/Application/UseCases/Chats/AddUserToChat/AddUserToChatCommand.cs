using Application.Common;
using Domain.Enums;
using MediatR;

namespace Application.UseCases.Chats.AddUserToChat;

public record AddUserToChatCommand(Guid ChatId,Guid UserId,Guid InitiatorUserId,ChatRole ChatRole):IRequest<IResult>;