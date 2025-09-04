using Application.Common;
using Application.DTOs.Friendship;
using AutoMapper;
using Domain.Enums;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Friendships.SearchIncomingFriendRequests;

public class SearchIncomingFriendRequestsHandler : 
    IRequestHandler<SearchIncomingFriendRequestsQuery, Result<IEnumerable<ReadFriendshipDto>>>
{
    private readonly IFriendshipRepository _friendshipRepository;
    private readonly IMapper _mapper;

    public SearchIncomingFriendRequestsHandler(IFriendshipRepository friendshipRepository, IMapper mapper)
    {
        _friendshipRepository = friendshipRepository;
        _mapper = mapper;
    }

    public async Task<Result<IEnumerable<ReadFriendshipDto>>> Handle(SearchIncomingFriendRequestsQuery request, CancellationToken cancellationToken)
    {
        var friendships = await _friendshipRepository
            .SearchIncomingFriendshipRequestsAsync(
                request.UserId,
                request.Query,
                request.LastCreatedAt,
                request.PageSize,
                FriendshipStatus.Pending,
                cancellationToken);

        // Map the entities - but we need to create DTOs that represent the sender, not the contact
        var mappedContacts = friendships.Select(uc => new ReadFriendshipDto
        {
            Id = uc.Id,
            Username = uc.User?.Username ?? "",
            Email = uc.User?.Email ?? "",
            DateOfBirth = uc.User?.DateOfBirth ?? DateTime.MinValue,
            Status = uc.Status,
            PrivateChatId = uc.PrivateChatId,
            CreatedAt = uc.CreatedAt
        });

        return Result<IEnumerable<ReadFriendshipDto>>.Success(mappedContacts);
    }
}
