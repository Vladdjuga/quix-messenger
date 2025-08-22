using Application.Common;
using Application.DTOs.Contact;
using AutoMapper;
using Domain.Enums;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Contacts.SearchIncomingFriendRequests;

public class SearchIncomingFriendRequestsHandler : 
    IRequestHandler<SearchIncomingFriendRequestsQuery, Result<IEnumerable<ReadContactDto>>>
{
    private readonly IUserContactRepository _userContactRepository;
    private readonly IMapper _mapper;

    public SearchIncomingFriendRequestsHandler(IUserContactRepository userContactRepository, IMapper mapper)
    {
        _userContactRepository = userContactRepository;
        _mapper = mapper;
    }

    public async Task<Result<IEnumerable<ReadContactDto>>> Handle(SearchIncomingFriendRequestsQuery request, CancellationToken cancellationToken)
    {
        var userContacts = await _userContactRepository
            .SearchIncomingContactRequestsAsync(
                request.UserId,
                request.Query,
                request.LastCreatedAt,
                request.PageSize,
                ContactStatus.Pending,
                cancellationToken);

        // Map the entities - but we need to create DTOs that represent the sender, not the contact
        var mappedContacts = userContacts.Select(uc => new ReadContactDto
        {
            Id = uc.Id,
            Username = uc.User?.Username ?? "",
            Email = uc.User?.Email ?? "",
            DateOfBirth = uc.User?.DateOfBirth ?? DateTime.MinValue,
            Status = uc.ContactStatus,
            PrivateChatId = uc.PrivateChatId,
            CreatedAt = uc.CreatedAt
        });

        return Result<IEnumerable<ReadContactDto>>.Success(mappedContacts);
    }
}
