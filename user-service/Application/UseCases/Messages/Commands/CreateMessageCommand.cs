using Application.Common;
using Application.DTOs.Message;
using MediatR;

namespace Application.UseCases.Messages.Commands;

public record CreateMessageCommand(string Text, Guid UserId, Guid ChatId) : IRequest<Result<ReadMessageDto>>;
