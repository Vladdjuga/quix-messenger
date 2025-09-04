using Application.Common;
using Application.DTOs.Friendship;
using Domain.Enums;
using MediatR;

namespace Application.UseCases.Friendships.SearchUsersFriendships;

public record SearchUsersFriendshipsQuery(
    Guid UserId,
    string Query,
    FriendshipStatus TargetStatus,
    DateTime? LastCreatedAt = null,
    int PageSize = 10
):IRequest<Result<IEnumerable<ReadFriendshipDto>>>;
