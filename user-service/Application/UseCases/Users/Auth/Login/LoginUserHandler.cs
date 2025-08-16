using Application.Auth;
using Application.Common;
using Application.DTOs.Auth;
using Application.Interfaces.Security;
using Application.Utilities;
using Domain.Entities;
using Domain.Repositories;
using MediatR;
using Microsoft.Extensions.Options;

namespace Application.UseCases.Users.Auth.Login;

public class LoginUserHandler:IRequestHandler<LoginUserCommand, Result<TokenDto>>
{
    private readonly IUserRepository _userRepository;
    private readonly IUserSessionRepository _userSessionRepository;
    private readonly IStringHasher _stringHasher;
    private readonly IJwtProvider _jwtProvider;
    private readonly JwtSettings _jwtSettings;

    public LoginUserHandler(IUserRepository userRepository, IStringHasher stringHasher,
        IJwtProvider jwtProvider, IUserSessionRepository userSessionRepository,
        IOptions<JwtSettings> jwtSettings)
    {
        _userRepository = userRepository;
        _stringHasher = stringHasher;
        _jwtProvider = jwtProvider;
        _userSessionRepository = userSessionRepository;
        _jwtSettings = jwtSettings.Value;
    }
    public async Task<Result<TokenDto>> Handle(LoginUserCommand request, CancellationToken cancellationToken)
    {
        UserEntity? userEntity = null;
        if (RegexValidator.IsEmail(request.Identity))
            userEntity = await _userRepository.GetByEmailAsync(request.Identity,cancellationToken);
        if (RegexValidator.IsUsername(request.Identity) && userEntity is null)
            userEntity = await _userRepository.GetByUserNameAsync(request.Identity, cancellationToken);
        if(userEntity == null)
            return Result<TokenDto>.Failure("User not found");
        
        if(!_stringHasher.Verify(request.Password, userEntity.PasswordHash))
            return Result<TokenDto>.Failure("Invalid Password");
        var refreshToken = _jwtProvider.GenerateRefreshToken();
        var userSession = new UserSessionEntity
        {
            UserId = userEntity.Id,
            HashedToken = _stringHasher.Hash(refreshToken),
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays),
            IsActive = true
        };
        await _userSessionRepository.AddAsync(userSession, cancellationToken);
        
        var accessToken = _jwtProvider.GenerateToken(
            userEntity.Id,
            userEntity.Username,
            userEntity.Email,
            userSession.Id);
        var dto = new TokenDto(accessToken, refreshToken, userSession.ExpiresAt);
        return Result<TokenDto>.Success(dto);
    }
}