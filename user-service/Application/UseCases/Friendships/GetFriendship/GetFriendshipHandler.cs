using Application.Common;
using Application.DTOs.Friendship;
using Application.Mappings;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Friendships.GetFriendship;

public class GetFriendshipHandler:IRequestHandler<GetFriendshipQuery,Result<ReadFriendshipDto>>
{
    private readonly IFriendshipRepository _friendshipRepository;

    public GetFriendshipHandler(IFriendshipRepository friendshipRepository)
    {
        _friendshipRepository = friendshipRepository;
    }

    public async Task<Result<ReadFriendshipDto>> Handle(GetFriendshipQuery request, CancellationToken cancellationToken)
    {
        var friendship = await _friendshipRepository.GetFriendshipWithUsersAsync(request.UserId, request.FriendId, cancellationToken);

        if (friendship is null)
            return Result<ReadFriendshipDto>.Failure("User contact not found");

        // Map manually - return the other user's information
        var dto = friendship.MapToDto(request.UserId);
        if(dto is null)
            return Result<ReadFriendshipDto>.Failure("Mapping to DTO failed");
        
        return Result<ReadFriendshipDto>.Success(dto);
    }
}
