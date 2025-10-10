using Application.Common;
using Application.DTOs.Message;
using Domain.Entities;
using Domain.Enums;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Messages.Commands;

public record CreateMessageCommand(string Text, Guid UserId, Guid ChatId) : IRequest<Result<ReadMessageDto>>;

public class CreateMessageHandler : IRequestHandler<CreateMessageCommand, Result<ReadMessageDto>>
{
    private readonly IMessageRepository _repository;
    private readonly IUserChatRepository _userChatRepository;

    public CreateMessageHandler(IMessageRepository repository, IUserChatRepository userChatRepository)
    {
        _repository = repository;
        _userChatRepository = userChatRepository;
    }
    public async Task<Result<ReadMessageDto>> Handle(CreateMessageCommand request, CancellationToken cancellationToken)
    {
        // Allow empty text if attachments will be added
        if (request.ChatId == Guid.Empty || request.UserId == Guid.Empty)
            return Result<ReadMessageDto>.Failure("Invalid chat or user ID");
            
        // Membership check: ensure user belongs to the chat
        var membership = await _userChatRepository.GetByUserAndChatAsync(request.UserId,
            request.ChatId, cancellationToken);
        if (membership is null)
            return Result<ReadMessageDto>.Failure("User is not a member of the chat");
        var message = new MessageEntity
        {
            ChatId = request.ChatId,
            Text = request.Text ?? string.Empty, // Allow empty text for attachment-only messages
            UserId = request.UserId,
            CreatedAt = DateTime.UtcNow,
            // When message reaches backend, we consider it Sent and Delivered
            Status = MessageStatus.Sent | MessageStatus.Delivered
        };
        await _repository.AddMessageAsync(message);
        var dto = new ReadMessageDto()
        {
            Id = message.Id,
            ChatId = message.ChatId,
            Text = message.Text,
            UserId = message.UserId,
            CreatedAt = message.CreatedAt,
            Status = message.Status,
            Attachments = new List<MessageAttachmentDto>() // Will be populated after upload if needed
        };
        return Result<ReadMessageDto>.Success(dto);
    }
}
