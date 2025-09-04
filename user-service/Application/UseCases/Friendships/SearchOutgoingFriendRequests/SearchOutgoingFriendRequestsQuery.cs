using Application.DTOs.Friendship;
using Application.Common;
using MediatR;

namespace Application.UseCases.Friendships.SearchOutgoingFriendRequests;

public record SearchOutgoingFriendRequestsQuery(
    Guid UserId,
    string Query,
    DateTime? LastCreatedAt,
    int PageSize
) : IRequest<Result<IEnumerable<ReadFriendshipDto>>>;
