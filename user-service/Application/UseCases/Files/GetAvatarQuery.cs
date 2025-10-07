using Application.Common;
using Application.DTOs;
using MediatR;

namespace Application.UseCases.Files;

public record GetAvatarQuery(Guid UserId) : IRequest<Result<FileStreamDto>>;
