using Application.Common;
using Domain.Entities;
using Domain.Enums;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Messages.Commands;

public class CreateMessageHandler : IRequestHandler<CreateMessageCommand, Result<Guid>>
{
    private readonly IMessageRepository _repository;
    private readonly IUserChatRepository _userChatRepository;
    private const int MaxMessageLength = 500;

    public CreateMessageHandler(IMessageRepository repository, IUserChatRepository userChatRepository)
    {
        _repository = repository;
        _userChatRepository = userChatRepository;
    }
    public async Task<Result<Guid>> Handle(CreateMessageCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Text) || request.Text.Length > MaxMessageLength ||
            request.ChatId == Guid.Empty || request.UserId == Guid.Empty)
        {
            return Result<Guid>.Failure("Invalid message text");
        }
        // Membership check: ensure user belongs to the chat
        var membership = await _userChatRepository.GetByUserAndChatAsync(request.UserId, request.ChatId, cancellationToken);
        if (membership is null)
            return Result<Guid>.Failure("User is not a member of the chat");
        var message = new MessageEntity
        {
            Id = Guid.NewGuid(),
            ChatId = request.ChatId,
            Text = request.Text,
            UserId = request.UserId,
            CreatedAt = request.CreatedAt,
            Status = MessageStatus.Sent
        };
        await _repository.AddMessageAsync(message);
        return Result<Guid>.Success(message.Id);
    }
}
