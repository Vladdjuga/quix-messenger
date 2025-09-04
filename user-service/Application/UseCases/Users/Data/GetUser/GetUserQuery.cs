using Application.Common;
using Application.DTOs.User;
using MediatR;

namespace Application.UseCases.Users.Data.GetUser;

public record GetUserQuery(string? Username,Guid UserGuid):IRequest<Result<ReadUserDto?>>;