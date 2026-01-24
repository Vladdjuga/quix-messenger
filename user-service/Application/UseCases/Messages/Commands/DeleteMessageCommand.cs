using Application.Common;
using Application.DTOs.Message;
using Application.Events;
using Application.Interfaces.Events;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Messages.Commands;

public record DeleteMessageCommand(Guid MessageId, Guid RequestingUserId) : IRequest<Result<bool>>;

public class DeleteMessageHandler : IRequestHandler<DeleteMessageCommand, Result<bool>>
{
    private readonly IMessageRepository _messageRepository;
    private readonly IUserChatRepository _userChatRepository;
    private readonly IEventPublisher _eventPublisher;

    public DeleteMessageHandler(IMessageRepository messageRepository, IUserChatRepository userChatRepository, IEventPublisher eventPublisher)
    {
        _messageRepository = messageRepository;
        _userChatRepository = userChatRepository;
        _eventPublisher = eventPublisher;
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
        
        // Publish event to message broker
        await _eventPublisher.PublishAsync(new MessageDeletedEvent
        {
            MessageId = msg.Id,
            ChatId = msg.ChatId,
            UserId = msg.UserId
        }, cancellationToken);
        
        return Result<bool>.Success(true);
    }
}
