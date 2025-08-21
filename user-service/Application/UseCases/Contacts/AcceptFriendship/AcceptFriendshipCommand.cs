using Application.Common;
using Application.DTOs.Contact;
using MediatR;

namespace Application.UseCases.Contacts.AcceptFriendship;

public record AcceptFriendshipCommand(Guid UserId, Guid ContactId)
    : IRequest<Result<ReadContactDto>>;


