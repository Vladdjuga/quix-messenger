using Application.Common;
using Application.DTOs.Contact;
using AutoMapper;
using Domain.Entities;
using Domain.Enums;
using Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.UseCases.Contacts.AcceptFriendship;

public class AcceptFriendshipHandler
    : IRequestHandler<AcceptFriendshipCommand, Result<ReadContactDto>>
{
    private readonly IChatRepository _chatRepository;
    private readonly IUserRepository _userRepository;
    private readonly IUserChatRepository _userChatRepository;
    private readonly IUserContactRepository _userContactRepository;
    private readonly IMapper _mapper;

    public AcceptFriendshipHandler(
        IChatRepository chatRepository,
        IUserRepository userRepository,
        IUserContactRepository userContactRepository,
        IUserChatRepository userChatRepository,
        IMapper mapper)
    {
        _chatRepository = chatRepository;
        _userRepository = userRepository;
        _userContactRepository = userContactRepository;
        _userChatRepository = userChatRepository;
        _mapper = mapper;
    }

    public async Task<Result<ReadContactDto>> Handle(AcceptFriendshipCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user is null)
            return Result<ReadContactDto>.Failure("User does not exist");

        // Find the UserContactEntity by UserContactId (which is actually the UserContactEntity.Id)
        // This represents the friendship request sent to the current user
        var existing = await _userContactRepository.GetByIdAsync(request.UserContactId, cancellationToken,
            include => include.Include(x => x.User).Include(x => x.Contact));
        
        if (existing is null || existing.ContactStatus != ContactStatus.Pending)
            return Result<ReadContactDto>.Failure("Friendship request not found");
            
        // The existing entity has UserId = sender, ContactId = receiver (current user)
        // We need to verify that the current user is indeed the receiver
        if (existing.ContactId != request.UserId)
            return Result<ReadContactDto>.Failure("Unauthorized to accept this friendship request");

        var sender = existing.User;
        if (sender is null)
            return Result<ReadContactDto>.Failure("Sender does not exist");

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
        existing.ContactStatus = ContactStatus.Active;
        await _userContactRepository.UpdateAsync(existing, cancellationToken);

        // No need to create a reverse relationship - we'll use the single record for both users
        // Return the relationship from the current user's perspective (accepting user)
        var dto = _mapper.Map<ReadContactDto>(existing, opts =>
        {
            opts.Items["CurrentUserId"] = request.UserId;
        });
        return Result<ReadContactDto>.Success(dto);
    }
}


