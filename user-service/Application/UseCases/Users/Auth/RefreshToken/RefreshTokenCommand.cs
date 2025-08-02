using Application.Common;
using Application.DTOs.Auth;
using MediatR;

namespace Application.UseCases.Users.Auth.RefreshToken;

public record RefreshTokenCommand(string RefreshToken,Guid SessionId) : IRequest<Result<TokenDto>>;