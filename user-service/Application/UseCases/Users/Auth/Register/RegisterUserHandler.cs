using Application.Common;
using Application.Interfaces;
using Application.Interfaces.Security;
using Application.Utilities;
using Domain.Entities;
using Domain.Repositories;
using MediatR;
using Microsoft.Extensions.Options;

namespace Application.UseCases.Users.Auth.Register;

public class RegisterUserHandler : IRequestHandler<RegisterUserCommand, Result<Guid>>
{
    private readonly IUserRepository _repository;
    private readonly IStringHasher _stringHasher;
    private readonly IUserDefaults _userDefaults;

    public RegisterUserHandler(
        IUserRepository repository,
        IStringHasher stringHasher,
        IUserDefaults defaults 
    )
    {
        _repository = repository;
        _stringHasher = stringHasher;
        _userDefaults = defaults; 
    }

    public async Task<Result<Guid>> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        if (await _repository.GetByEmailAsync(request.Email, cancellationToken) is not null)
            return Result<Guid>.Failure("Email already exists");

        if (await _repository.GetByUserNameAsync(request.Username, cancellationToken) is not null)
            return Result<Guid>.Failure("Username already exists");

        var user = new UserEntity
        {
            AvatarUrl = _userDefaults.DefaultAvatar,
            Username = request.Username,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            DateOfBirth = request.DateOfBirth.ToUniversalTime(),
            CreatedAt = DateTime.UtcNow,
            PasswordHash = _stringHasher.Hash(request.Password),
        };

        await _repository.AddAsync(user, cancellationToken);
        return Result<Guid>.Success(user.Id);
    }
}