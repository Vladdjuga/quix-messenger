using FluentValidation;

namespace Application.UseCases.Chats.UpdateChat;

public class UpdateChatCommandValidator : AbstractValidator<UpdateChatCommand>
{
    public UpdateChatCommandValidator()
    {
        RuleFor(x => x.ChatId)
            .NotEmpty()
            .WithMessage("Chat ID is required");

        RuleFor(x => x.InitiatorUserId)
            .NotEmpty()
            .WithMessage("Initiator User ID is required");

        RuleFor(x => x.Title)
            .NotEmpty()
            .WithMessage("Title is required")
            .MinimumLength(1)
            .MaximumLength(100)
            .WithMessage("Title must be between 1 and 100 characters");
    }
}
