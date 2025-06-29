using System.Text.RegularExpressions;
using Application.Auth;
using Application.Common;
using Application.Interfaces.Security;
using Application.Utilities;
using Domain.Entities;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Users.Auth;

public class LoginUserHandler:IRequestHandler<LoginUserCommand, Result<(string,string)>>
{
    private readonly IUserRepository _userRepository;
    private readonly IUserSessionRepository _userSessionRepository;
    private readonly IStringHasher _stringHasher;
    private readonly IJwtProvider _jwtProvider;

    public LoginUserHandler(IUserRepository userRepository, IStringHasher stringHasher,
        IJwtProvider jwtProvider, IUserSessionRepository userSessionRepository)
    {
        _userRepository = userRepository;
        _stringHasher = stringHasher;
        _jwtProvider = jwtProvider;
        _userSessionRepository = userSessionRepository;
    }
    public async Task<Result<(string,string)>> Handle(LoginUserCommand request, CancellationToken cancellationToken)
    {
        UserEntity? userEntity = null;
        if (IdentityValidator.IsEmail(request.Identity))
        {
            userEntity=await _userRepository.GetByEmailAsync(request.Identity,cancellationToken);
        }
        else if (IdentityValidator.IsUsername(request.Identity))
        {
            userEntity = await _userRepository.GetByUserNameAsync(request.Identity,cancellationToken);
        }
        else
            return Result<(string,string)>.Failure("Invalid Identity");
        if(userEntity == null)
            return Result<(string,string)>.Failure("User not found");
        if(!_stringHasher.Verify(request.Password, userEntity.PasswordHash))
            return Result<(string,string)>.Failure("Invalid Password");
        var accessToken = _jwtProvider.GenerateToken(userEntity.Id,userEntity.Username,userEntity.Email.Address);
        var refreshToken = _jwtProvider.GenerateRefreshToken();
        var userSession = new UserSessionEntity
        {
            UserId = userEntity.Id,
            HashedToken = _stringHasher.Hash(refreshToken),
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(7), // Set expiration for 7 days
        };
        return Result<(string,string)>.Success((accessToken, refreshToken));
    }
}