import { ReadUserDto } from "@/lib/dto/ReadUserDto";
import { api } from "@/app/api";
import { UserStatus } from "@/lib/types/enums";

export interface UserWithStatus {
  user: ReadUserDto;
  status: UserStatus;
  friendshipId?: string;
}

const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE ?? 20);

export async function getUserStatuses(users: ReadUserDto[]): Promise<UserWithStatus[]> {
  if (users.length === 0) return [];
  
  try {
    const [requests, sentRequests, friends] = await Promise.all([
      api.friendship.getFriendRequests("", PAGE_SIZE).then(res => res.data),
      api.friendship.getSentRequests("", PAGE_SIZE).then(res => res.data),
      api.friendship.getFriendships(PAGE_SIZE).then(res => res.data),
    ]);

    return users.map(user => {
      const friend = friends.find(f => f.username === user.username);
      if (friend) {
        return { user, status: UserStatus.Friends, friendshipId: friend.id };
      }

      const request = requests.find(r => r.username === user.username);
      if (request) {
        return { user, status: UserStatus.PendingReceived, friendshipId: request.id };
      }

      const sentRequest = sentRequests.find(r => r.username === user.username);
      if (sentRequest) {
        return { user, status: UserStatus.PendingSent, friendshipId: sentRequest.id };
      }

      return { user, status: UserStatus.NotFriends };
    });
  } catch (error) {
    console.error('Failed to get user statuses:', error);
    return users.map(user => ({ user, status: UserStatus.NotFriends }));
  }
}

export async function searchUsers(query: string, lastCreatedAt?: string): Promise<UserWithStatus[]> {
  if (!query.trim()) return [];

  try {
    const users = await api.user.searchUsers(query, PAGE_SIZE, lastCreatedAt)
      .then(res => res.data);
    return await getUserStatuses(users);
  } catch (error) {
    console.error('User search failed:', error);
    throw new Error('Search failed');
  }
}
