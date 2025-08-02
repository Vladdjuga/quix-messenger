using Application.Common;
using Application.DTOs.Auth;
using MediatR;

namespace Application.UseCases.Users.Auth.Login;

public record LoginUserCommand(string Identity,string Password):IRequest<Result<TokenDto>>;