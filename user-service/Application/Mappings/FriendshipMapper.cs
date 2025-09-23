using Application.DTOs.Friendship;
using Domain.Entities;

namespace Application.Mappings;

public static class FriendshipMapper
{
    /// <summary>
    /// Maps a FriendshipEntity to ReadFriendshipDto from the perspective of the specified user.
    /// Returns the "other" user's information in the friendship.
    /// </summary>
    /// <param name="friendship">The friendship entity to map</param>
    /// <param name="currentUserId">The ID of the current user (perspective)</param>
    /// <returns>ReadFriendshipDto containing the other user's information</returns>
    public static ReadFriendshipDto? MapToDto(this FriendshipEntity friendship, Guid currentUserId)
    {
        // Determine which user is the "other" user from the current user's perspective
        var otherUser = currentUserId == friendship.UserId ? friendship.Friend : friendship.User;
        return otherUser is null ? null : friendship.MapToDto(otherUser);
    }

    /// <summary>
    /// Maps a FriendshipEntity to ReadFriendshipDto using a specific target user.
    /// Useful when you want to return a specific user's information regardless of friendship direction.
    /// </summary>
    /// <param name="friendship">The friendship entity to map</param>
    /// <param name="targetUser">The specific user to include in the DTO</param>
    /// <returns>ReadFriendshipDto containing the target user's information</returns>
    public static ReadFriendshipDto MapToDto(this FriendshipEntity friendship, UserEntity targetUser)
    {
        return new ReadFriendshipDto
        {
            Id = friendship.Id,
            UserId = targetUser?.Id ?? Guid.Empty,
            AvatarUrl = targetUser?.AvatarUrl ?? "",
            Username = targetUser?.Username ?? "",
            Email = targetUser?.Email ?? "",
            DateOfBirth = targetUser?.DateOfBirth ?? DateTime.MinValue,
            Status = friendship.Status,
            CreatedAt = friendship.CreatedAt,
            PrivateChatId = friendship.PrivateChatId
        };
    }
}
