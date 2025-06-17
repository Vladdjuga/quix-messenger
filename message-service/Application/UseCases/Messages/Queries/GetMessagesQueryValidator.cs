using FluentValidation;

namespace Application.UseCases.Messages.Queries;

public class GetMessagesQueryValidator:AbstractValidator<GetMessagesQuery>
{
    public GetMessagesQueryValidator()
    {
        RuleFor(x=>x.Count)
            .GreaterThan(0);
    }
}