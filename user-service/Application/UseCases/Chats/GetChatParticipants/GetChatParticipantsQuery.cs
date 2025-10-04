using Application.Common;
using Application.DTOs.Chat;
using MediatR;

namespace Application.UseCases.Chats.GetChatParticipants;

public record GetChatParticipantsQuery(Guid ChatId, Guid InitiatorUserId) : IRequest<Result<IEnumerable<ChatParticipantDto>>>;
