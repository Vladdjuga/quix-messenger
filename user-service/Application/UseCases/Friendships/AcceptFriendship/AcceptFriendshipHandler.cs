using Application.Common;
using Application.DTOs.Friendship;
using AutoMapper;
using Domain.Entities;
using Domain.Enums;
using Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.UseCases.Friendships.AcceptFriendship;

public class AcceptFriendshipHandler
    : IRequestHandler<AcceptFriendshipCommand, Result<ReadFriendshipDto>>
{
    private readonly IChatRepository _chatRepository;
    private readonly IUserRepository _userRepository;
    private readonly IUserChatRepository _userChatRepository;
    private readonly IFriendshipRepository _friendshipRepository;
    private readonly IMapper _mapper;

    public AcceptFriendshipHandler(
        IChatRepository chatRepository,
        IUserRepository userRepository,
        IFriendshipRepository friendshipRepository,
        IUserChatRepository userChatRepository,
        IMapper mapper)
    {
        _chatRepository = chatRepository;
        _userRepository = userRepository;
        _friendshipRepository = friendshipRepository;
        _userChatRepository = userChatRepository;
        _mapper = mapper;
    }

    public async Task<Result<ReadFriendshipDto>> Handle(AcceptFriendshipCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user is null)
            return Result<ReadFriendshipDto>.Failure("User does not exist");

        // Find the FriendshipEntity by FriendshipId (which is actually the FriendshipEntity.Id)
        // This represents the friendship request sent to the current user
        var existing = await _friendshipRepository.GetByIdAsync(request.FriendshipId, cancellationToken,
            include => include.Include(x => x.User).Include(x => x.Friend));
        
        if (existing is null || existing.Status != FriendshipStatus.Pending)
            return Result<ReadFriendshipDto>.Failure("Friendship request not found");
            
        // The existing entity has UserId = sender, FriendId = receiver (current user)
        // We need to verify that the current user is indeed the receiver
        if (existing.FriendId != request.UserId)
            return Result<ReadFriendshipDto>.Failure("Unauthorized to accept this friendship request");

        var sender = existing.User;
        if (sender is null)
            return Result<ReadFriendshipDto>.Failure("Sender does not exist");

        // Create private chat on acceptance
        var privateChat = new ChatEntity
        {
            Id = Guid.NewGuid(),
            Title = $"Direct chat between {user.Username} and {sender.Username}",
            CreatedAt = DateTime.UtcNow,
            IsPrivate = true,
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
        var senderChat = new UserChatEntity
        {
            ChatId = privateChat.Id,
            UserId = sender.Id,
            ChatRole = ChatRole.Admin,
            IsMuted = false
        };
        await _userChatRepository.AddAsync(userChat,cancellationToken);
        await _userChatRepository.AddAsync(senderChat,cancellationToken);

        // Update the existing relationship to Active and set the private chat
        existing.PrivateChatId = privateChat.Id;
        existing.Status = FriendshipStatus.Active;
        await _friendshipRepository.UpdateAsync(existing, cancellationToken);

        // No need to create a reverse relationship - we'll use the single record for both users
        // Return the relationship from the current user's perspective (accepting user)
        var dto = _mapper.Map<ReadFriendshipDto>(existing, opts =>
        {
            opts.Items["CurrentUserId"] = request.UserId;
        });
        return Result<ReadFriendshipDto>.Success(dto);
    }
}


