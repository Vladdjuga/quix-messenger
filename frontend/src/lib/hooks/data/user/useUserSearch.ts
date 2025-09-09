import { useState, useEffect } from 'react';
import { UserStatus } from "@/lib/types/enums";
import { useAsyncState } from "@/lib/hooks/useAsyncState";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { searchUsers, UserWithStatus } from "@/lib/services/userSearchService";

export type { UserWithStatus };

export function useUserSearch() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [hasMore, setHasMore] = useState(false);
  const [lastCreatedAt, setLastCreatedAt] = useState<string>();
  
  const {
    data: results,
    loading,
    error,
    setData: setResults,
    setLoading,
    setError,
    reset
  } = useAsyncState<UserWithStatus[]>([]);

  async function performSearch(append = false) {
    if (!debouncedQuery.trim()) {
      reset();
      setHasMore(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const users = await searchUsers(debouncedQuery, append ? lastCreatedAt : undefined);
      
      if (append) {
        setResults(prev => [...prev, ...users]);
      } else {
        setResults(users);
      }
      
      setHasMore(users.length === 20); // PAGE_SIZE
      if (users.length > 0) {
        setLastCreatedAt(users[users.length - 1].user.createdAt.toString());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  function updateUserStatus(username: string, newStatus: UserStatus, friendshipId?: string) {
    setResults(prev =>
      prev.map(item =>
        item.user.username === username 
          ? { ...item, status: newStatus, friendshipId } 
          : item
      )
    );
  }

  function removeUser(username: string) {
    setResults(prev => prev.filter(item => item.user.username !== username));
  }

  useEffect(() => {
    performSearch();
    setLastCreatedAt(undefined); // Reset pagination when query changes
  }, [debouncedQuery]);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    hasMore,
    loadMore: () => performSearch(true),
    updateUserStatus,
    removeUser,
    refresh: () => performSearch(false)
  };
}
