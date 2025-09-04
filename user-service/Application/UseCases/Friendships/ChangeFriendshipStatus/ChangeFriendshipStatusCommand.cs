using Application.Common;
using Domain.Enums;
using MediatR;

namespace Application.UseCases.Friendships.ChangeFriendshipStatus;

public record ChangeFriendshipStatusCommand(Guid UserId,Guid FriendId,FriendshipStatus FriendshipStatus) : IRequest<IResult>;
