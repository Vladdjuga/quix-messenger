using Application.Common;
using MediatR;

namespace Application.UseCases.Users.Auth.InvalidateToken;

public record InvalidateTokenCommand(Guid? UserId):IRequest<IResult>;