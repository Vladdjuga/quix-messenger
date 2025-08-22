using Application.Common;
using Application.DTOs.Contact;
using Domain.Enums;
using MediatR;

namespace Application.UseCases.Contacts.SearchIncomingFriendRequests;

public record SearchIncomingFriendRequestsQuery(
    Guid UserId,
    string Query,
    DateTime? LastCreatedAt = null,
    int PageSize = 10
) : IRequest<Result<IEnumerable<ReadContactDto>>>;
