using Application.Common;
using Application.DTOs.Friendship;
using Application.Mappings;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Friendships.SearchUsersFriendships;

public class SearchUsersFriendshipsHandler: 
    IRequestHandler<SearchUsersFriendshipsQuery,Result<IEnumerable<ReadFriendshipDto>>>
{
    private readonly IFriendshipRepository _friendshipRepository;

    public SearchUsersFriendshipsHandler(IFriendshipRepository friendshipRepository)
    {
        _friendshipRepository = friendshipRepository;
    }
    public async Task<Result<IEnumerable<ReadFriendshipDto>>> Handle(SearchUsersFriendshipsQuery request, CancellationToken cancellationToken)
    {
        var friendships = await _friendshipRepository
            .SearchFriendshipsByUsernameAsync(
                request.UserId,
                request.Query,
                request.LastCreatedAt,
                request.PageSize,
                request.TargetStatus,
                cancellationToken);

        if (!friendships.Any())
            return Result<IEnumerable<ReadFriendshipDto>>.Success([]);

        // Map manually - return the other user's information for each friendship
        var mapped = friendships
            .Select(friendship => friendship.MapToDto(request.UserId))
            .Where(dto => dto is not null)
            .Cast<ReadFriendshipDto>();
        return Result<IEnumerable<ReadFriendshipDto>>.Success(mapped);
    }
}
