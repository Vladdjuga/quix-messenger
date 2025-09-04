using Application.Common;
using Application.DTOs.Friendship;
using MediatR;

namespace Application.UseCases.Friendships.GetFriendship;

public record GetFriendshipQuery(Guid UserId,Guid FriendId):IRequest<Result<ReadFriendshipDto>>;
