using Application.Common;
using Application.DTOs.Friendship;
using AutoMapper;
using Domain.Entities;
using Domain.Enums;
using Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.UseCases.Friendships.RequestFriendship;

public class RequestFriendshipHandler
    : IRequestHandler<RequestFriendshipCommand, Result<ReadFriendshipDto>>
{
    private readonly IUserRepository _userRepository;
    private readonly IFriendshipRepository _friendshipRepository;
    private readonly IMapper _mapper;

    public RequestFriendshipHandler(
        IUserRepository userRepository,
        IFriendshipRepository friendshipRepository,
        IMapper mapper)
    {
        _userRepository = userRepository;
        _friendshipRepository = friendshipRepository;
        _mapper = mapper;
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

        var loadedFriendship = await _friendshipRepository.GetByIdAsync(
            pending.Id,
            cancellationToken,
            include => include.Include(x => x.Friend));

        var dto = _mapper.Map<ReadFriendshipDto>(loadedFriendship);
        return Result<ReadFriendshipDto>.Success(dto);
    }
}


