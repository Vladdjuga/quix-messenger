using Application.Common;
using Domain.Enums;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Messages.Commands;

public record EditMessageCommand(Guid MessageId, Guid RequestingUserId, string NewText) : IRequest<Result<bool>>;

public class EditMessageHandler : IRequestHandler<EditMessageCommand, Result<bool>>
{
    private readonly IMessageRepository _messageRepository;
    private readonly IUserChatRepository _userChatRepository;

    public EditMessageHandler(IMessageRepository messageRepository, IUserChatRepository userChatRepository)
    {
        _messageRepository = messageRepository;
        _userChatRepository = userChatRepository;
    }

    public async Task<Result<bool>> Handle(EditMessageCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.NewText))
            return Result<bool>.Failure("Text cannot be empty");

        var msg = await _messageRepository.GetByIdAsync(request.MessageId, cancellationToken);
        if (msg is null)
            return Result<bool>.Failure("Message not found");

        // Only the author can edit for now
        if (msg.UserId != request.RequestingUserId)
        {
            var membership = await _userChatRepository.GetByUserAndChatAsync(request.RequestingUserId, msg.ChatId, cancellationToken);
            if (membership is null)
                return Result<bool>.Failure("Forbidden");
            return Result<bool>.Failure("Forbidden");
        }

        msg.Text = request.NewText.Trim();
        msg.Status = MessageStatus.Modified;
        await _messageRepository.UpdateAsync(msg, cancellationToken);
        return Result<bool>.Success(true);
    }
}
