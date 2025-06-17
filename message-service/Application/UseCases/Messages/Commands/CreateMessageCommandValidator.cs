using FluentValidation;

namespace Application.UseCases.Messages.Commands;

public class CreateMessageCommandValidator:AbstractValidator<CreateMessageCommand>
{
    public CreateMessageCommandValidator()
    {
        RuleFor(x => x.Text)
            .NotEmpty().WithMessage("Message cannot be empty")
            .MaximumLength(500).WithMessage("Maximum length 500 characters");

        RuleFor(x => x.ChatId)
            .NotEmpty().WithMessage("ChatId cannot be empty");

        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("UserId cannot be empty");
    }
}