using Application.Common;
using Application.DTOs.Friendship;
using MediatR;

namespace Application.UseCases.Friendships.RequestFriendship;

public record RequestFriendshipCommand(Guid UserId, string FriendUsername)
    : IRequest<Result<ReadFriendshipDto>>;


