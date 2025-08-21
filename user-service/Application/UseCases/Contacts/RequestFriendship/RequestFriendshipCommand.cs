using Application.Common;
using Application.DTOs.Contact;
using MediatR;

namespace Application.UseCases.Contacts.RequestFriendship;

public record RequestFriendshipCommand(Guid UserId, string ContactUsername)
    : IRequest<Result<ReadContactDto>>;


