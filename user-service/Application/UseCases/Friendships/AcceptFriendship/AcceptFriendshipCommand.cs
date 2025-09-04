using Application.Common;
using Application.DTOs.Friendship;
using MediatR;

namespace Application.UseCases.Friendships.AcceptFriendship;

public record AcceptFriendshipCommand(Guid UserId, Guid FriendshipId)
    : IRequest<Result<ReadFriendshipDto>>;


