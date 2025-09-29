using Application.Common;
using Application.DTOs.User;
using AutoMapper;
using Domain.Enums;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Users.SearchUsers;

public class SearchUsersHandler : IRequestHandler<SearchUsersQuery, Result<IEnumerable<ReadUserDto>>>
{
    private readonly IUserRepository _userRepository;
    private readonly IFriendshipRepository _friendshipRepository;
    private readonly IMapper _mapper;

    public SearchUsersHandler(IUserRepository userRepository, IFriendshipRepository friendshipRepository, IMapper mapper)
    {
        _userRepository = userRepository;
        _friendshipRepository = friendshipRepository;
        _mapper = mapper;
    }

    public async Task<Result<IEnumerable<ReadUserDto>>> Handle(SearchUsersQuery request, CancellationToken cancellationToken)
    {
        // Trim and validate the query
        var pageSize = request.PageSize;
        if (request.PageSize <= 0)
            pageSize = 10;
        
        var users = await _userRepository.SearchUsersByUsernameAsync(
            request.Query.Trim(),
            request.LastCreatedAt,
            pageSize,
            cancellationToken,
            request.ExcludeUserId);
        var result = _mapper.Map<List<ReadUserDto>>(users);

        // If we have a current user, fetch relationship status for all returned users in a single pass
        if (!request.ExcludeUserId.HasValue || result.Count <= 0)
            return Result<IEnumerable<ReadUserDto>>.Success(result);
        
        var currentUserId = request.ExcludeUserId.Value;
        var userIds = result.Select(r => r.Id).ToList();
        
        var friendships = await _friendshipRepository.GetFriendshipsWithUsersAsync(
            currentUserId,
            userIds,
            cancellationToken);
        var byOtherUser = friendships.ToDictionary(
            f => f.UserId == currentUserId ? f.FriendId : f.UserId,
            f => f
        );

        foreach (var dto in result)
        {
            if (!byOtherUser.TryGetValue(dto.Id, out var friendship))
            {
                dto.RelationshipStatus = RelationshipStatusDto.None;
                dto.FriendshipId = null;
                dto.PrivateChatId = null;
                continue;
            }

            // Determine direction
            var initiatedByCurrent = friendship.UserId == currentUserId;
            dto.RelationshipStatus = friendship.Status switch
            {
                FriendshipStatus.Active => RelationshipStatusDto.Friends,
                FriendshipStatus.Pending => initiatedByCurrent
                    ? RelationshipStatusDto.PendingSent
                    : RelationshipStatusDto.PendingReceived,
                FriendshipStatus.Blocked => RelationshipStatusDto.Blocked,
                _ => RelationshipStatusDto.None
            };
            dto.FriendshipId = friendship.Id;
            dto.PrivateChatId = friendship.PrivateChatId;
        }

        return Result<IEnumerable<ReadUserDto>>.Success(result);
    }
}
