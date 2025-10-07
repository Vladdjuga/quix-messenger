using Application.Common;
using Application.DTOs.Message;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Attachments;

public record GetAttachmentsCommand(Guid MessageId) : IRequest<Result<IEnumerable<MessageAttachmentDto>>>;

public class GetAttachmentsHandler : IRequestHandler<GetAttachmentsCommand, Result<IEnumerable<MessageAttachmentDto>>>
{
    private readonly IMessageAttachmentRepository _attachmentRepository;

    public GetAttachmentsHandler(IMessageAttachmentRepository attachmentRepository)
    {
        _attachmentRepository = attachmentRepository;
    }

    public async Task<Result<IEnumerable<MessageAttachmentDto>>> Handle(GetAttachmentsCommand request, CancellationToken cancellationToken)
    {
        var messageAttachments = await _attachmentRepository.GetByMessageIdAsync(
            request.MessageId,
            cancellationToken);
        
        var attachmentDtos = messageAttachments.Select(attachment => new MessageAttachmentDto
        {
            Id = attachment.Id,
            Name = attachment.FileName,
            ContentType = attachment.MimeType,
            Size = attachment.FileSize,
            Url = $"/api/Attachment/download/{attachment.Id}"
        }).ToList();
        
        return attachmentDtos.Count == 0 ? 
            Result<IEnumerable<MessageAttachmentDto>>.Failure("No attachments found for the specified message.") :
            Result<IEnumerable<MessageAttachmentDto>>.Success(attachmentDtos);
    }
}