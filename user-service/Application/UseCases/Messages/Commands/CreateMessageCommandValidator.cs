using FluentValidation;

namespace Application.UseCases.Messages.Commands;

public class CreateMessageCommandValidator : AbstractValidator<CreateMessageCommand>
{
    public CreateMessageCommandValidator()
    {
        RuleFor(x => x.Text)
            .NotEmpty()
            .MaximumLength(500);
        RuleFor(x => x.ChatId)
            .NotEmpty();
        RuleFor(x => x.UserId)
            .NotEmpty();
    }
}
