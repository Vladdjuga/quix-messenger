using Application.Common;
using Application.DTOs.Friendship;
using Application.Mappings;
using Domain.Entities;
using Domain.Enums;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Friendships.RequestFriendship;

public class RequestFriendshipHandler
    : IRequestHandler<RequestFriendshipCommand, Result<ReadFriendshipDto>>
{
    private readonly IUserRepository _userRepository;
    private readonly IFriendshipRepository _friendshipRepository;

    public RequestFriendshipHandler(
        IUserRepository userRepository,
        IFriendshipRepository friendshipRepository)
    {
        _userRepository = userRepository;
        _friendshipRepository = friendshipRepository;
    }

    public async Task<Result<ReadFriendshipDto>> Handle(RequestFriendshipCommand request,
        CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user is null)
            return Result<ReadFriendshipDto>.Failure("User does not exist");
        
        var friend = await _userRepository.GetByUserNameAsync(
            request.FriendUsername, cancellationToken);
        
        if (friend is null)
            return Result<ReadFriendshipDto>.Failure("Friend does not exist");

        var existing = await _friendshipRepository.GetFriendshipAsync(
            request.UserId, friend.Id, cancellationToken);
        if (existing is not null)
            return Result<ReadFriendshipDto>.Failure("Friendship already exists");

        var pending = new FriendshipEntity
        {
            UserId = request.UserId,
            FriendId = friend.Id,
            Status = FriendshipStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            PrivateChatId = null
        };

        await _friendshipRepository.AddAsync(pending, cancellationToken);

        var loadedFriendship = await _friendshipRepository.GetByIdWithNavigationAsync(
            pending.Id,
            cancellationToken);

        if(loadedFriendship?.Friend is null)
            return Result<ReadFriendshipDto>.Failure("Failed to load created friendship");
        // Map manually - return the friend's information
        var dto = loadedFriendship.MapToDto(loadedFriendship.Friend);
        return Result<ReadFriendshipDto>.Success(dto);
    }
}


