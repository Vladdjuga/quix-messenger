using Application.Common;
using Application.DTOs;
using MediatR;

namespace Application.UseCases.Files;

public record UploadAvatarCommand(FileDto File, Guid UserId) : IRequest<Result<string>>;