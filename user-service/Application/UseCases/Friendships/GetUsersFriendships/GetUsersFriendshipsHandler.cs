using Application.Common;
using Application.DTOs.Friendship;
using AutoMapper;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Friendships.GetUsersFriendships;

public class GetUsersFriendshipsHandler:
    IRequestHandler<GetUsersFriendshipsQuery,Result<IEnumerable<ReadFriendshipDto>>>
{
    private readonly IFriendshipRepository _friendshipRepository;
    private readonly IMapper _mapper;

    public GetUsersFriendshipsHandler(IFriendshipRepository friendshipRepository, IMapper mapper)
    {
        _friendshipRepository = friendshipRepository;
        _mapper = mapper;
    }
    public async Task<Result<IEnumerable<ReadFriendshipDto>>> Handle(GetUsersFriendshipsQuery request, CancellationToken cancellationToken)
    {
        var friendships = await _friendshipRepository
            .GetAllUsersFriendshipsAsync(request.UserId,
                request.LastCreatedAt,
                request.PageSize,
                cancellationToken);

        if (!friendships.Any())
            return Result<IEnumerable<ReadFriendshipDto>>.Success([]);

        // Pass current user id so mapper can choose the opposite side
        var mapped = _mapper.Map<IEnumerable<ReadFriendshipDto>>(friendships, opts =>
        {
            opts.Items["CurrentUserId"] = request.UserId;
        });
        return Result<IEnumerable<ReadFriendshipDto>>.Success(mapped);
    }
}
