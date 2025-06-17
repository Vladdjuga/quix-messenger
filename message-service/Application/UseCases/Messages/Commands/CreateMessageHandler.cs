using Application.Common;
using AutoMapper;
using Domain.Entities;
using Domain.Enums;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Messages.Commands;

public class CreateMessageHandler:IRequestHandler<CreateMessageCommand, Result<Guid>>
{
    private readonly IMessageRepository _repository;
    private const int MaxMessageLength = 500;

    public CreateMessageHandler(IMessageRepository repository)
    {
        _repository = repository;
    }
    public async Task<Result<Guid>> Handle(CreateMessageCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Text) || request.Text.Length>MaxMessageLength ||
            request.ChatId == Guid.Empty || request.UserId == Guid.Empty)
        {
            return Result<Guid>.Failure("Invalid message text");
        }
        var message = new MessageEntity
        {
            Id = Guid.NewGuid(),
            ChatId = request.ChatId,
            Text = request.Text,
            UserId = request.UserId,
            ReceivedAt = DateTime.Now,
            SentAt = request.SentAt,
            Status = MessageStatus.Sent
        };
        await _repository.AddMessageAsync(message);
        return Result<Guid>.Success(message.Id);
    }
}