using Application.Common;
using Application.Interfaces.Security;
using Domain.Entities;
using Domain.Repositories;
using Domain.ValueObjects;
using MediatR;

namespace Application.UseCases.Users.Auth;

public class RegisterUserHandler:IRequestHandler<RegisterUserCommand, Result<Guid>>
{
    private readonly IUserRepository _repository;
    private readonly IStringHasher _stringHasher;
    public RegisterUserHandler(IUserRepository repository, IStringHasher stringHasher)
    {
        _repository = repository;
        _stringHasher = stringHasher;
    }
    public async Task<Result<Guid>> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        var user = new UserEntity
        {
            Username = request.Username,
            Email = new Email(request.Email),
            FirstName = request.FirstName,
            LastName = request.LastName,
            DateOfBirth = request.DateOfBirth,
            CreatedAt = DateTime.Now,
            PasswordHash = _stringHasher.Hash(request.Password),
        };
        await _repository.AddAsync(user,cancellationToken);
        return Result<Guid>.Success(user.Id);
    }
}