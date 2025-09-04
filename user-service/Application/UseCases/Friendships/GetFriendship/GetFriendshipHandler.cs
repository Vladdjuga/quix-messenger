using Application.Common;
using Application.DTOs.Friendship;
using AutoMapper;
using Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.UseCases.Friendships.GetFriendship;

public class GetFriendshipHandler:IRequestHandler<GetFriendshipQuery,Result<ReadFriendshipDto>>
{
    private readonly IFriendshipRepository _friendshipRepository;
    private readonly IMapper _mapper;

    public GetFriendshipHandler(IFriendshipRepository friendshipRepository, IMapper mapper)
    {
        _friendshipRepository = friendshipRepository;
        _mapper = mapper;
    }

    public async Task<Result<ReadFriendshipDto>> Handle(GetFriendshipQuery request, CancellationToken cancellationToken)
    {
        var friendship=await _friendshipRepository.GetFriendshipAsync(request.UserId,request.FriendId,
            cancellationToken,
            include=>include.Include(x=>x.Friend));
        return friendship is null ?
            Result<ReadFriendshipDto>.Failure("User contact not found") : 
            Result<ReadFriendshipDto>.Success(_mapper.Map<ReadFriendshipDto>(friendship));
    }
}
