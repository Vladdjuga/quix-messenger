using Application.Common;
using Application.DTOs.Contact;
using MediatR;

namespace Application.UseCases.Contacts.CreateContactByUsername;

public record CreateContactByUsernameCommand(Guid UserId,string ContactUsername)
    :IRequest<Result<ReadContactDto>>;