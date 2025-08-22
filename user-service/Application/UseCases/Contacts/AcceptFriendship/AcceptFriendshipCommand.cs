using Application.Common;
using Application.DTOs.Contact;
using MediatR;

namespace Application.UseCases.Contacts.AcceptFriendship;

public record AcceptFriendshipCommand(Guid UserId, Guid UserContactId)
    : IRequest<Result<ReadContactDto>>;


