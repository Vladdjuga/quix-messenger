using Application.Common;
using Application.DTOs.Contact;
using MediatR;

namespace Application.UseCases.Contacts.SearchUsersContacts;

public record SearchUsersContactsQuery(
    Guid UserId,
    string Query,
    DateTime? LastCreatedAt = null,
    int PageSize = 10
):IRequest<Result<IEnumerable<ReadContactDto>>>;