using Application.Common;
using MediatR;

namespace Application.UseCases.Users.Auth.Login;

public record LoginUserCommand(string Identity,string Password):IRequest<Result<(string, string)>>;