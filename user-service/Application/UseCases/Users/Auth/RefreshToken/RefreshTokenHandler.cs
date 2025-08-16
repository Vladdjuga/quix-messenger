using Application.Auth;
using Application.Common;
using Application.DTOs.Auth;
using Application.Interfaces.Security;
using Domain.Repositories;
using MediatR;
using Microsoft.Extensions.Options;

namespace Application.UseCases.Users.Auth.RefreshToken;

public class RefreshTokenHandler:IRequestHandler<RefreshTokenCommand, Result<TokenDto>>
{
    private readonly IUserSessionRepository _userSessionRepository;
    private readonly IJwtProvider _jwtProvider;
    private readonly JwtSettings _jwtSettings;
    private readonly IStringHasher _stringHasher;

    public RefreshTokenHandler(IUserSessionRepository userSessionRepository,
        IJwtProvider jwtProvider,IOptions<JwtSettings> jwtSettings, IStringHasher stringHasher)
    {
        _userSessionRepository = userSessionRepository;
        _jwtProvider = jwtProvider;
        _stringHasher = stringHasher;
        _jwtSettings = jwtSettings.Value;
    }

    public async Task<Result<TokenDto>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var userSession = await _userSessionRepository.GetByIdWithUserAsync(request.SessionId, cancellationToken);
        
        // Validate the user session
        if (userSession is null || !userSession.IsActive || userSession.ExpiresAt < DateTime.UtcNow)
            return Result<TokenDto>.Failure("Invalid or expired session");
        if(userSession.User is null)
            return Result<TokenDto>.Failure("User not found");
        if (!_stringHasher.Verify(request.RefreshToken, userSession.HashedToken))
        {
            userSession.IsActive = false;
            await _userSessionRepository.UpdateAsync(userSession, cancellationToken);
            return Result<TokenDto>.Failure("Invalid Refresh Token");
        }
        
        // Generate a new access token
        var accessToken = _jwtProvider.GenerateToken(
            userSession.UserId,
            userSession.User.Username,
            userSession.User.Email,
            userSession.Id);
        // Update the session's expiration time and hashed token
        userSession.ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays);
        var refreshToken = _jwtProvider.GenerateRefreshToken();
        userSession.HashedToken = _stringHasher.Hash(refreshToken);

        await _userSessionRepository.UpdateAsync(userSession, cancellationToken);
        
        var dto = new TokenDto(
            accessToken,
            refreshToken,
            userSession.ExpiresAt);
        
        return Result<TokenDto>.Success(dto);
    }
}