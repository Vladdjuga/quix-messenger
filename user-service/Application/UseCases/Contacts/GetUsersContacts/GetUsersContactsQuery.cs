using Application.Common;
using Application.DTOs.Contact;
using MediatR;

namespace Application.UseCases.Contacts.GetUsersContacts;

public record GetUsersContactsQuery(
    Guid UserId,
    DateTime? LastCreatedAt = null,
    int PageSize = 10
):IRequest<Result<IEnumerable<ReadContactDto>>>;