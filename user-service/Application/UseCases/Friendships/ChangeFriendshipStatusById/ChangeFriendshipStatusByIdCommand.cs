using Application.Common;
using Domain.Enums;
using MediatR;

namespace Application.UseCases.Friendships.ChangeFriendshipStatusById;

public record ChangeFriendshipStatusByIdCommand(Guid UserId, Guid FriendshipId, FriendshipStatus FriendshipStatus) : IRequest<IResult>;
