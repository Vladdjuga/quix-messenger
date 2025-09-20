using Application.Common;
using Application.DTOs.Message;
using Domain.Entities;
using Domain.Enums;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Messages.Commands;

public class CreateMessageHandler : IRequestHandler<CreateMessageCommand, Result<ReadMessageDto>>
{
    private readonly IMessageRepository _repository;
    private readonly IUserChatRepository _userChatRepository;
    private const int MaxMessageLength = 500;

    public CreateMessageHandler(IMessageRepository repository, IUserChatRepository userChatRepository)
    {
        _repository = repository;
        _userChatRepository = userChatRepository;
    }
    public async Task<Result<ReadMessageDto>> Handle(CreateMessageCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Text) || request.Text.Length > MaxMessageLength ||
            request.ChatId == Guid.Empty || request.UserId == Guid.Empty)
        {
            return Result<ReadMessageDto>.Failure("Invalid message text");
        }
        // Membership check: ensure user belongs to the chat
        var membership = await _userChatRepository.GetByUserAndChatAsync(request.UserId,
            request.ChatId, cancellationToken);
        if (membership is null)
            return Result<ReadMessageDto>.Failure("User is not a member of the chat");
        var message = new MessageEntity
        {
            ChatId = request.ChatId,
            Text = request.Text,
            UserId = request.UserId,
            CreatedAt = DateTime.UtcNow,
            Status = MessageStatus.Delivered // Default status
        };
        await _repository.AddMessageAsync(message);
        var dto = new ReadMessageDto()
        {
            Id = message.Id,
            ChatId = message.ChatId,
            Text = message.Text,
            UserId = message.UserId,
            CreatedAt = message.CreatedAt,
            Status = message.Status
        };
        return Result<ReadMessageDto>.Success(dto);
    }
}
