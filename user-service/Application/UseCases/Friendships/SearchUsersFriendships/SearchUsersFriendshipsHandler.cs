using Application.Common;
using Application.DTOs.Friendship;
using AutoMapper;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Friendships.SearchUsersFriendships;

public class SearchUsersFriendshipsHandler: 
    IRequestHandler<SearchUsersFriendshipsQuery,Result<IEnumerable<ReadFriendshipDto>>>
{
    private readonly IFriendshipRepository _friendshipRepository;
    private readonly IMapper _mapper;

    public SearchUsersFriendshipsHandler(IFriendshipRepository friendshipRepository, IMapper mapper)
    {
        _friendshipRepository = friendshipRepository;
        _mapper = mapper;
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

        var mapped = _mapper.Map<IEnumerable<ReadFriendshipDto>>(friendships, opts =>
        {
            opts.Items["CurrentUserId"] = request.UserId;
        });
        return Result<IEnumerable<ReadFriendshipDto>>.Success(mapped);
    }
}
