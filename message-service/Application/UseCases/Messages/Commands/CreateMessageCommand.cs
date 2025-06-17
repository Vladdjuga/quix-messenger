using Application.Common;
using MediatR;

namespace Application.UseCases.Messages.Commands;

public record CreateMessageCommand(string Text,Guid UserId,Guid ChatId,DateTime SentAt):IRequest<Result<Guid>>;