using Application.Common;
using Application.DTOs.Friendship;
using Application.Mappings;
using Domain.Enums;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Friendships.SearchOutgoingFriendRequests;

public class SearchOutgoingFriendRequestsHandler : IRequestHandler<SearchOutgoingFriendRequestsQuery, Result<IEnumerable<ReadFriendshipDto>>>
{
    private readonly IFriendshipRepository _friendshipRepository;

    public SearchOutgoingFriendRequestsHandler(IFriendshipRepository friendshipRepository)
    {
        _friendshipRepository = friendshipRepository;
    }

    public async Task<Result<IEnumerable<ReadFriendshipDto>>> Handle(SearchOutgoingFriendRequestsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var friendshipEntities = await _friendshipRepository.SearchOutgoingFriendshipRequestsAsync(
                request.UserId,
                request.Query,
                request.LastCreatedAt,
                request.PageSize,
                FriendshipStatus.Pending,
                cancellationToken);

            // Map the entities manually - we need to represent the recipient (Friend), not the sender
            var mappedContacts = friendshipEntities
                .Where(uc => uc.Friend is not null)
                .Select(uc => uc.MapToDto(uc.Friend!));

            return Result<IEnumerable<ReadFriendshipDto>>.Success(mappedContacts);
        }
        catch (Exception ex)
        {
            return Result<IEnumerable<ReadFriendshipDto>>.Failure($"Failed to search outgoing friend requests: {ex.Message}");
        }
    }
}
