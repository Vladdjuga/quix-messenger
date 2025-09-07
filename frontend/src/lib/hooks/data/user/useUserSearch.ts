import { useState, useEffect, useCallback } from 'react';
import { ReadUserDto } from "@/lib/dto/ReadUserDto";
import { api } from "@/app/api";
import { UserStatus } from "@/lib/types/enums";

type UserRelationshipStatus = UserStatus;

export interface UserWithStatus {
  user: ReadUserDto;
  status: UserRelationshipStatus;
  friendshipId?: string;
}

const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE ?? 20);

export function useUserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserWithStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastCreatedAt, setLastCreatedAt] = useState<string>();

  async function getStatuses(users: ReadUserDto[]): Promise<UserWithStatus[]> {
    try {
      const [requests, sentRequests, friends] = await Promise.all([
        api.friendship.getFriendRequests("", PAGE_SIZE)
          .then(res => res.data),
        api.friendship.getSentRequests("", PAGE_SIZE)
          .then(res => res.data),
        api.friendship.getFriendships(PAGE_SIZE)
          .then(res => res.data),
      ]);

      return users.map(user => {
        const friend = friends.find(f => f.username === user.username);
        if (friend) return { user, status: UserStatus.Friends, friendshipId: friend.id };

        const request = requests.find(r => r.username === user.username);
        if (request) return { user, status: UserStatus.PendingReceived, friendshipId: request.id };

        const sentRequest = sentRequests.find(r => r.username === user.username);
        if (sentRequest) return { user, status: UserStatus.PendingSent, friendshipId: sentRequest.id };

        return { user, status: UserStatus.NotFriends };
      });
    } catch {
      return users.map(user => ({ user, status: UserStatus.NotFriends }));
    }
  }

  const fetchUsers = useCallback(async (append = false) => {
    if (!query.trim()) {
      setResults([]);
      setHasMore(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const users = await api.user.searchUsers(query, PAGE_SIZE, append ? lastCreatedAt : undefined)
        .then(res => res.data);
      const withStatuses = await getStatuses(users);

      setResults(prev => (append ? [...prev, ...withStatuses] : withStatuses));
      setHasMore(users.length === PAGE_SIZE);
      setLastCreatedAt(users.at(-1)?.createdAt.toString());
    } catch (e) {
      setError((e as Error).message ?? "Search failed");
    } finally {
      setLoading(false);
    }
  }, [query, lastCreatedAt]);

  function updateUserStatus(username: string, newStatus: UserStatus, friendshipId?: string) {
    setResults(prev =>
      prev.map(u =>
        u.user.username === username 
          ? { ...u, status: newStatus, friendshipId } 
          : u
      )
    );
  }

  function removeUser(username: string) {
    setResults(prev => prev.filter(u => u.user.username !== username));
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, fetchUsers]);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    hasMore,
    fetchMore: () => fetchUsers(true),
    updateUserStatus,
    removeUser,
    refetch: () => fetchUsers(false)
  };
}
