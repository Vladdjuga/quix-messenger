import { useEffect } from 'react';
import { ReadFriendshipDto } from "@/lib/dto/ReadFriendshipDto";
import { useAsyncState } from "@/lib/hooks/useAsyncState";
import { 
  fetchFriendRequests, 
  fetchSentRequests, 
  fetchFriendships 
} from "@/lib/services/friendshipService";

export function useFriendRequests() {
  const {
    data: requests,
    loading,
    error,
    setData: setRequests,
    setLoading,
    setError
  } = useAsyncState<ReadFriendshipDto[]>([]);

  async function loadRequests() {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchFriendRequests();
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }

  function removeRequest(friendshipId: string) {
    setRequests(prev => prev.filter(r => r.id !== friendshipId));
  }

  useEffect(() => {
    loadRequests();
  }, []);

  return {
    requests,
    loading,
    error,
    refresh: loadRequests,
    removeRequest
  };
}

export function useSentRequests() {
  const {
    data: sentRequests,
    loading,
    error,
    setData: setSentRequests,
    setLoading,
    setError
  } = useAsyncState<ReadFriendshipDto[]>([]);

  async function loadSentRequests() {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchSentRequests();
      setSentRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sent requests");
    } finally {
      setLoading(false);
    }
  }

  function removeRequest(friendshipId: string) {
    setSentRequests(prev => prev.filter(r => r.id !== friendshipId));
  }

  useEffect(() => {
    loadSentRequests();
  }, []);

  return {
    sentRequests,
    loading,
    error,
    refresh: loadSentRequests,
    removeRequest
  };
}

export function useFriends() {
  const {
    data: friends,
    loading,
    error,
    setData: setFriends,
    setLoading,
    setError
  } = useAsyncState<ReadFriendshipDto[]>([]);

  async function loadFriends() {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchFriendships();
      setFriends(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load friends");
    } finally {
      setLoading(false);
    }
  }

  function removeFriend(friendshipId: string) {
    setFriends(prev => prev.filter(f => f.id !== friendshipId));
  }

  useEffect(() => {
    loadFriends();
  }, []);

  return {
    friends,
    loading,
    error,
    refresh: loadFriends,
    removeFriend
  };
}
