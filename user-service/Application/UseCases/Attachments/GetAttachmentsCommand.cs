using Application.Common;
using Application.DTOs;
using Application.Interfaces;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Attachments;

public record GetAttachmentsCommand(Guid MessageId) : IRequest<Result<IEnumerable<FileStreamDto>>>;

public class GetAttachmentsHandler : IRequestHandler<GetAttachmentsCommand, Result<IEnumerable<FileStreamDto>>>
{
    private readonly IMessageAttachmentStorageService _storageService;
    private readonly IMessageAttachmentRepository _attachmentRepository;

    public GetAttachmentsHandler(IMessageAttachmentStorageService storageService, IMessageAttachmentRepository attachmentRepository)
    {
        _storageService = storageService;
        _attachmentRepository = attachmentRepository;
    }

    public async Task<Result<IEnumerable<FileStreamDto>>> Handle(GetAttachmentsCommand request, CancellationToken cancellationToken)
    {
        var messageAttachments = await _attachmentRepository.GetByMessageIdAsync(
            request.MessageId,
            cancellationToken);
        var fileDtos = await Task.WhenAll(
            messageAttachments.Select(async (attachment) =>
            {
                var fileContent = await _storageService.GetFileStreamAsync(attachment.FileUrl, cancellationToken);
                return new FileStreamDto()
                {
                    Name = attachment.FileName,
                    ContentType = attachment.MimeType,
                    Content = fileContent
                };
            })
        );
        return fileDtos.Length == 0 ? 
            Result<IEnumerable<FileStreamDto>>.Failure("No attachments found for the specified message.") :
            Result<IEnumerable<FileStreamDto>>.Success(fileDtos);
    }
}