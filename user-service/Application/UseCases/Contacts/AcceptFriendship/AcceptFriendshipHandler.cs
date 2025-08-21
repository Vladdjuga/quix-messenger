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

        var contact = await _userRepository.GetByIdAsync(request.ContactId, cancellationToken);
        if (contact is null)
            return Result<ReadContactDto>.Failure("Contact does not exist");

        var existing = await _userContactRepository.GetUserContactAsync(
            request.UserId, contact.Id, cancellationToken);
        if (existing is null || existing.ContactStatus != ContactStatus.Pending)
            return Result<ReadContactDto>.Failure("Friendship request not found");

        // Create private chat on acceptance
        var privateChat = new ChatEntity
        {
            Id = Guid.NewGuid(),
            Title = "Direct chat between "+user.Username+" and "+contact.Username,
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
        var contactChat = new UserChatEntity
        {
            ChatId = privateChat.Id,
            UserId = contact.Id,
            ChatRole = ChatRole.Admin,
            IsMuted = false
        };
        await _userChatRepository.AddAsync(userChat,cancellationToken);
        await _userChatRepository.AddAsync(contactChat,cancellationToken);

        existing.PrivateChatId = privateChat.Id;
        existing.ContactStatus = ContactStatus.Active;
        await _userContactRepository.UpdateAsync(existing, cancellationToken);

        var loaded = await _userContactRepository.GetByIdAsync(existing.Id, cancellationToken,
            include => include.Include(x => x.Contact));

        var dto = _mapper.Map<ReadContactDto>(loaded);
        return Result<ReadContactDto>.Success(dto);
    }
}


