using Domain.Enums;
using FluentValidation;

namespace Application.UseCases.Chats.CreateChat;

public class CreateChatCommandValidator:AbstractValidator<CreateChatCommand>
{
    public CreateChatCommandValidator()
    {
        RuleFor(x => x.ChatName)
            .NotEmpty()
            .WithMessage("Chat name is required")
            .MaximumLength(150)
            .WithMessage("Chat name cannot exceed 150 characters");
        
        RuleFor(x => x.ChatType)
            .NotEqual(ChatType.Direct)
            .WithMessage("Direct chats cannot be created manually. They are automatically created when accepting a friend request.");
    }
}