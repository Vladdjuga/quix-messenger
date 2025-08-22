using System.Linq.Expressions;
using Application.Common;
using Application.DTOs.Contact;
using Domain.Entities;
using Domain.Enums;
using MediatR;

namespace Application.UseCases.Contacts.SearchUsersContacts;

public record SearchUsersContactsQuery(
    Guid UserId,
    string Query,
    ContactStatus TargetStatus,
    DateTime? LastCreatedAt = null,
    int PageSize = 10
):IRequest<Result<IEnumerable<ReadContactDto>>>;