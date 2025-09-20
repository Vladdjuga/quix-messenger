using Application.Common;
using Application.DTOs.Message;
using MediatR;

namespace Application.UseCases.Messages.Queries;

public record GetMessagesQuery(Guid ChatId, Guid UserId, int Count) : IRequest<Result<IEnumerable<ReadMessageDto>>>;
