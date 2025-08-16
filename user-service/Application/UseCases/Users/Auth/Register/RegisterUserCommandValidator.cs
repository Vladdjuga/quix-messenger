using Application.Utilities;
using FluentValidation;

namespace Application.UseCases.Users.Auth.Register;

public class RegisterUserCommandValidator:AbstractValidator<RegisterUserCommand>
{
    public RegisterUserCommandValidator()
    {
        RuleFor(x => x.Password)
            .NotEmpty()
            .Must(RegexValidator.IsValidPassword)
            .WithMessage("Password must be 8-128 characters long, contain at least one uppercase letter, one lowercase letter, one digit, one special character, and no spaces.");

        RuleFor(x => x.Username)
            .NotEmpty()
            .Must(RegexValidator.IsUsername)
            .WithMessage("Username must be 3-32 characters long and can only contain letters, digits, and underscores.");

        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .Must(RegexValidator.IsEmail) // IMPORTANT: This ensures the email format is valid
            .WithMessage("Email must be a valid email address.");

        RuleFor(x => x.FirstName)
            .NotEmpty()
            .Matches(@"^[A-Z][a-zA-Z\-']{1,31}$")
            .WithMessage("First name must start with a capital letter and contain only letters, hyphens, or apostrophes (max 32 chars).");

        RuleFor(x => x.LastName)
            .NotEmpty()
            .Matches(@"^[A-Z][a-zA-Z\-']{1,31}$")
            .WithMessage("Last name must start with a capital letter and contain only letters, hyphens, or apostrophes (max 32 chars).");

        RuleFor(x => x.DateOfBirth)
            .NotEmpty()
            .LessThan(new DateTime(2010, 1, 1))
            .GreaterThan(new DateTime(1900, 1, 1))
            .WithMessage("Date of birth must be between 1900-01-01 and 2010-01-01.");
    }
}