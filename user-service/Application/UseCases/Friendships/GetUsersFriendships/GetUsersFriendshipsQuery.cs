using Application.Common;
using Application.DTOs.Friendship;
using MediatR;

namespace Application.UseCases.Friendships.GetUsersFriendships;

public record GetUsersFriendshipsQuery(
    Guid UserId,
    DateTime? LastCreatedAt = null,
    int PageSize = 10
):IRequest<Result<IEnumerable<ReadFriendshipDto>>>;
