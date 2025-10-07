using Application.Common;
using Application.DTOs;
using MediatR;

namespace Application.UseCases.Files;

// Uses a stream to handle large files efficiently
public record UploadAvatarCommand(FileStreamDto File, Guid UserId) : IRequest<Result<string>>;