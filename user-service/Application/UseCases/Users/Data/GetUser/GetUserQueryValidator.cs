using FluentValidation;

namespace Application.UseCases.Users.Data.GetUser;

public class GetUserQueryValidator:AbstractValidator<GetUserQuery>
{
    public GetUserQueryValidator()
    {
        RuleFor(x => x.UserGuid).NotEmpty();
        //RuleFor(x => x.Username).NotEmpty();
    }
}