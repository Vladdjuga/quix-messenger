using Application.Common;
using Application.Interfaces.DTOs;
using MediatR;

namespace Application.UseCases.Users.Data.GetUser;

public record GetUserQuery(string? Username,Guid UserGuid):IRequest<Result<IReadUserDto?>>;