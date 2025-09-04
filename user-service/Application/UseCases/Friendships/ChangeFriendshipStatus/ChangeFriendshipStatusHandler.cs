using Application.Common;
using AutoMapper;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Friendships.ChangeFriendshipStatus;

public class ChangeFriendshipStatusHandler:IRequestHandler<ChangeFriendshipStatusCommand,IResult>
{
    private readonly IFriendshipRepository _friendshipRepository;
    private readonly IMapper _mapper;

    public ChangeFriendshipStatusHandler(IFriendshipRepository friendshipRepository, IMapper mapper)
    {
        _friendshipRepository = friendshipRepository;
        _mapper = mapper;
    }

    public async Task<IResult> Handle(ChangeFriendshipStatusCommand request, CancellationToken cancellationToken)
    {
        var friendship = await _friendshipRepository.GetFriendshipAsync(request.UserId,
            request.FriendId,
            cancellationToken);
        if(friendship is null)
            return Result.Failure("Friendship not found");
        await _friendshipRepository.ChangeStatusAsync(friendship.Id,request.FriendshipStatus,cancellationToken);
        return Result.Success();
    }
}
