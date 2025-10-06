using Application.Common;
using Application.DTOs.Friendship;
using Application.Mappings;
using Domain.Entities;
using Domain.Enums;
using Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.UseCases.Friendships.CreateFriendship;

public class CreateFriendshipHandler:IRequestHandler<CreateFriendshipCommand,Result<ReadFriendshipDto>>
{
    private readonly IChatRepository _chatRepository;
    private readonly IUserRepository _userRepository;
    private readonly IUserChatRepository _userChatRepository;
    private readonly IFriendshipRepository _friendshipRepository;

    public CreateFriendshipHandler(IChatRepository chatRepository, IUserRepository userRepository,
        IFriendshipRepository friendshipRepository, IUserChatRepository userChatRepository)
    {
        _chatRepository = chatRepository;
        _userRepository = userRepository;
        _friendshipRepository = friendshipRepository;
        _userChatRepository = userChatRepository;
    }
    public async Task<Result<ReadFriendshipDto>> Handle(CreateFriendshipCommand request,
        CancellationToken cancellationToken)
    {
        var friendship = await _friendshipRepository.GetFriendshipAsync(request.UserId, request.FriendId, cancellationToken);
        if(friendship is not null)
            return Result<ReadFriendshipDto>.Failure("User contact already exists");
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user is null)
            return Result<ReadFriendshipDto>.Failure("User does not exist");
        var friend = await _userRepository.GetByIdAsync(request.FriendId, cancellationToken);
        if (friend is null)
            return Result<ReadFriendshipDto>.Failure("Friend does not exist");
        var privateChat = new ChatEntity
        {
            Id = Guid.NewGuid(),
            Title = "Direct chat between "+user.Username+" and "+friend.Username,
            AvatarUrl = null, // Default avatar for direct chats
            CreatedAt = DateTime.UtcNow,
            ChatType = ChatType.Direct
        };
        await _chatRepository.AddAsync(privateChat, cancellationToken);
        var userChat = new UserChatEntity
        {
            ChatId = privateChat.Id,
            UserId = request.UserId,
            ChatRole = ChatRole.Admin,
            IsMuted = false
        };
        var contactChat = new UserChatEntity
        {
            ChatId = privateChat.Id,
            UserId = request.FriendId,
            ChatRole = ChatRole.Admin,
            IsMuted = false
        };
        await _userChatRepository.AddAsync(userChat,cancellationToken);
        await _userChatRepository.AddAsync(contactChat,cancellationToken);
        var friendshipEntity = new FriendshipEntity
        {
            Id=Guid.NewGuid(),
            UserId = request.UserId,
            FriendId = request.FriendId,
            Status = FriendshipStatus.Active,
            CreatedAt = DateTime.UtcNow,
            PrivateChatId = privateChat.Id
        };
        await _friendshipRepository.AddAsync(friendshipEntity, cancellationToken);
        var loadedFriendship = await _friendshipRepository.GetByIdAsync(friendshipEntity.Id, cancellationToken, 
            include => include
                .Include(x => x.Friend)
                .Include(x => x.User)
        );
        if(loadedFriendship.Friend is null)
            return Result<ReadFriendshipDto>.Failure("Failed to load created friendship");
        // Map manually - return the friend's information
        var dto = loadedFriendship.MapToDto(loadedFriendship.Friend);
        return Result<ReadFriendshipDto>.Success(dto);
    }
}
