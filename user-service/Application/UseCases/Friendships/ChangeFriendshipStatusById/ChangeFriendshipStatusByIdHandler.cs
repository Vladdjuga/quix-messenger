using Application.Common;
using Domain.Enums;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Friendships.ChangeFriendshipStatusById;

public class ChangeFriendshipStatusByIdHandler : IRequestHandler<ChangeFriendshipStatusByIdCommand, IResult>
{
    private readonly IFriendshipRepository _friendshipRepository;

    public ChangeFriendshipStatusByIdHandler(IFriendshipRepository friendshipRepository)
    {
        _friendshipRepository = friendshipRepository;
    }

    public async Task<IResult> Handle(ChangeFriendshipStatusByIdCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Get the friendship to verify the user has access to it
            var friendship = await _friendshipRepository.GetByIdAsync(request.FriendshipId, 
                cancellationToken);
            
            // Verify that the requesting user is involved in this friendship
            if (friendship.UserId != request.UserId && friendship.FriendId != request.UserId)
                return Result.Failure("You don't have permission to modify this friendship");

            // If cancelling or rejecting, delete the record instead of changing status
            if (request.FriendshipStatus is FriendshipStatus.Cancelled or FriendshipStatus.Rejected)
                await _friendshipRepository.DeleteAsync(request.FriendshipId, cancellationToken);
            else
                await _friendshipRepository.ChangeStatusAsync(request.FriendshipId, request.FriendshipStatus, cancellationToken);
            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to change friendship status: {ex.Message}");
        }
    }
}
