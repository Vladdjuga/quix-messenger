using Application.Common;
using Application.DTOs.Message;
using MediatR;

namespace Application.UseCases.Messages.Queries;

public record GetMessagesPaginatedQuery(Guid ChatId, Guid UserId,
    DateTime LastCreatedAt, int PageSize) : IRequest<Result<IEnumerable<ReadMessageDto>>>;
