using Application.Common;
using Application.DTOs.Friendship;
using Domain.Enums;
using MediatR;

namespace Application.UseCases.Friendships.SearchIncomingFriendRequests;

public record SearchIncomingFriendRequestsQuery(
    Guid UserId,
    string Query,
    DateTime? LastCreatedAt = null,
    int PageSize = 10
) : IRequest<Result<IEnumerable<ReadFriendshipDto>>>;
