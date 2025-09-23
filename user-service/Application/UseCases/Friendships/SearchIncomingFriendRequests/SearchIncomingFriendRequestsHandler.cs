using Application.Common;
using Application.DTOs.Friendship;
using Application.Mappings;
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
        if (!friendships.Any())
            return Result<IEnumerable<ReadFriendshipDto>>.Success([]);

        // Map the entities - but we need to create DTOs that represent the sender, not the contact
        var mappedFriends = friendships
            .Where(uc => uc.User != null)
            .Select(uc => uc.MapToDto(uc.User!));

        return Result<IEnumerable<ReadFriendshipDto>>.Success(mappedFriends);
    }
}
