using Application.Common;
using Domain.Entities;
using Domain.Enums;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Chats.UpdateChat;

public class UpdateChatHandler : IRequestHandler<UpdateChatCommand, IResult>
{
    private readonly IChatRepository _chatRepository;
    private readonly IUserChatRepository _userChatRepository;

    public UpdateChatHandler(IChatRepository chatRepository, IUserChatRepository userChatRepository)
    {
        _chatRepository = chatRepository;
        _userChatRepository = userChatRepository;
    }

    public async Task<IResult> Handle(UpdateChatCommand request, CancellationToken cancellationToken)
    {
        var chat = await _chatRepository.GetByIdAsync(request.ChatId, cancellationToken);
        if (chat is null)
            return Result.Failure("Chat not found");

        // Only allow updating Group chats
        if (chat.ChatType != ChatType.Group)
            return Result.Failure("Only group chats can be updated");

        // Check if initiator is in the chat and has permission
        var initiatorUserChat = await _userChatRepository.GetByUserAndChatAsync(
            request.InitiatorUserId, request.ChatId, cancellationToken);
        
        if (initiatorUserChat is null)
            return Result.Failure("You are not a member of this chat");

        // Only Admins and Moderators can update chat
        if (initiatorUserChat.ChatRole > ChatRole.Moderator)
            return Result.Failure("Insufficient permissions to update chat");

        // Create updated entity
        var updatedChat = new ChatEntity
        {
            Id = chat.Id,
            Title = request.Title,
            ChatType = chat.ChatType,
            CreatedAt = chat.CreatedAt,
            AvatarUrl = chat.AvatarUrl
        };

        await _chatRepository.UpdateAsync(updatedChat, cancellationToken);
        return Result.Success();
    }
}
