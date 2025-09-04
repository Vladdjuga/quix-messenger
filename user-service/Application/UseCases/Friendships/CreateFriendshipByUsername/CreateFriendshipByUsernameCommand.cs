using Application.Common;
using Application.DTOs.Friendship;
using MediatR;

namespace Application.UseCases.Friendships.CreateFriendshipByUsername;

public record CreateContactByUsernameCommand(Guid UserId,string FriendUsername)
    :IRequest<Result<ReadFriendshipDto>>;
