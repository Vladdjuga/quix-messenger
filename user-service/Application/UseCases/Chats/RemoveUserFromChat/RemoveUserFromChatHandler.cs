using Application.Common;
using Domain.Enums;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Chats.RemoveUserFromChat;

public class RemoveUserFromChatHandler : IRequestHandler<RemoveUserFromChatCommand, IResult>
{
    private readonly IChatRepository _chatRepository;
    private readonly IUserChatRepository _userChatRepository;

    public RemoveUserFromChatHandler(IChatRepository chatRepository, IUserChatRepository userChatRepository)
    {
        _chatRepository = chatRepository;
        _userChatRepository = userChatRepository;
    }

    public async Task<IResult> Handle(RemoveUserFromChatCommand request, CancellationToken cancellationToken)
    {
        var chat = await _chatRepository.GetByIdAsync(request.ChatId, cancellationToken);
        if (chat is null)
            return Result.Failure("Chat not found");

        // Cannot remove users from Direct chats
        if (chat.ChatType == ChatType.Direct)
            return Result.Failure("Cannot remove users from direct chats");

        // Check if the user to be removed is in the chat
        var userToRemove = await _userChatRepository.GetByUserAndChatAsync(
            request.UserId, request.ChatId, cancellationToken);
        
        if (userToRemove is null)
            return Result.Failure("User is not in this chat");

        // Check if initiator is in the chat
        var initiator = await _userChatRepository.GetByUserAndChatAsync(
            request.InitiatorUserId, request.ChatId, cancellationToken);
        
        if (initiator is null)
            return Result.Failure("You are not a member of this chat");

        // Users can remove themselves
        if (request.UserId == request.InitiatorUserId)
        {
            await _userChatRepository.DeleteAsync(userToRemove, cancellationToken);
            return Result.Success();
        }

        // Otherwise, check permissions
        // Only Admins and Moderators can remove others
        if (initiator.ChatRole > ChatRole.Moderator)
            return Result.Failure("Insufficient permissions to remove users");

        // Cannot remove someone with equal or higher rank
        if (initiator.ChatRole >= userToRemove.ChatRole)
            return Result.Failure("Cannot remove user with equal or higher rank");

        await _userChatRepository.DeleteAsync(userToRemove, cancellationToken);
        return Result.Success();
    }
}
