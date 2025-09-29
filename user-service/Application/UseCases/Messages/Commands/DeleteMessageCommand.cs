using Application.Common;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Messages.Commands;

public record DeleteMessageCommand(Guid MessageId, Guid RequestingUserId) : IRequest<Result<bool>>;

public class DeleteMessageHandler : IRequestHandler<DeleteMessageCommand, Result<bool>>
{
    private readonly IMessageRepository _messageRepository;
    private readonly IUserChatRepository _userChatRepository;

    public DeleteMessageHandler(IMessageRepository messageRepository, IUserChatRepository userChatRepository)
    {
        _messageRepository = messageRepository;
        _userChatRepository = userChatRepository;
    }

    public async Task<Result<bool>> Handle(DeleteMessageCommand request, CancellationToken cancellationToken)
    {
        var msg = await _messageRepository.GetByIdAsync(request.MessageId, cancellationToken);
        if (msg is null)
            return Result<bool>.Failure("Message not found");

        // Allow deletion by author or chat admin (membership check can be expanded later)
        if (msg.UserId != request.RequestingUserId)
        {
            // Ensure the user is a member and has admin/mod rights if needed (skipped for now)
            var membership = await _userChatRepository.GetByUserAndChatAsync(request.RequestingUserId, msg.ChatId, cancellationToken);
            if (membership is null)
                return Result<bool>.Failure("Forbidden");
            // TODO: check membership.ChatRole for admin/mod if you want privileged deletions
            return Result<bool>.Failure("Forbidden");
        }

        await _messageRepository.DeleteAsync(msg, cancellationToken);
        return Result<bool>.Success(true);
    }
}
