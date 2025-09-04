using Application.Common;
using Application.DTOs.Friendship;
using MediatR;

namespace Application.UseCases.Friendships.CreateFriendship;

public record CreateFriendshipCommand(Guid UserId,Guid FriendId):IRequest<Result<ReadFriendshipDto>>;
