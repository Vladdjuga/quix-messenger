import { useState, useEffect, useCallback } from 'react';
import type { User } from "@/lib/types";
import { api } from "@/app/api";
import { UserStatus } from "@/lib/types/enums";
import { mapReadUserDtos } from "@/lib/mappers/userMapper";

export interface UserWithStatus {
  user: User;
  status: UserStatus;
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

  // Backend now returns relationshipStatus and friendship/private chat ids directly

  const fetchUsers = useCallback(async (append = false) => {
    if (!query.trim()) {
      setResults([]);
      setHasMore(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const usersDto = await api.user.searchUsers(query, PAGE_SIZE, append ? lastCreatedAt : undefined)
        .then(res => res.data);
      const users = mapReadUserDtos(usersDto);
      const withStatuses: UserWithStatus[] = users.map(u => ({
        user: u,
        status: u.relationshipStatus ?? UserStatus.NotFriends,
        friendshipId: u.friendshipId,
      }));

      setResults(prev => (append ? [...prev, ...withStatuses] : withStatuses));
      setHasMore(users.length === PAGE_SIZE);
      setLastCreatedAt(usersDto.at(-1)?.createdAt?.toString());
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
