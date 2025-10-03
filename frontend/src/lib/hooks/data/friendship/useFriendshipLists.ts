import {useState, useEffect, useCallback} from 'react';
import type { Friendship } from "@/lib/types";
import { api } from "@/app/api";
import { mapReadFriendshipDtos } from "@/lib/mappers/friendshipMapper";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants/pagination";

const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE ?? DEFAULT_PAGE_SIZE);

export function useFriendRequests() {
  const [requests, setRequests] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastCreatedAt, setLastCreatedAt] = useState<string>();

  const fetchRequests = useCallback(async (append = false) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.friendship.getFriendRequests(append && lastCreatedAt ? lastCreatedAt : "", PAGE_SIZE);
      const newRequests = mapReadFriendshipDtos(response.data);
      setRequests(prev => (append ? [...prev, ...newRequests] : newRequests));
      setHasMore(newRequests.length === PAGE_SIZE);
      setLastCreatedAt(response.data.at(-1)?.createdAt?.toString());
    } catch (e) {
      setError((e as Error).message ?? "Failed to load friend requests");
    } finally {
      setLoading(false);
    }
  }, [lastCreatedAt]);

  function removeRequest(friendshipId: string) {
    setRequests(prev => prev.filter(r => r.id !== friendshipId));
  }

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return {
    requests,
    loading,
    error,
    hasMore,
    refetch: () => fetchRequests(false),
    fetchMore: () => fetchRequests(true),
    removeRequest
  };
}

export function useSentRequests() {
  const [sentRequests, setSentRequests] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastCreatedAt, setLastCreatedAt] = useState<string>();

  const fetchSentRequests = useCallback(async (append = false) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.friendship.getSentRequests(append && lastCreatedAt ? lastCreatedAt : "", PAGE_SIZE);
      const newRequests = mapReadFriendshipDtos(response.data);
      setSentRequests(prev => (append ? [...prev, ...newRequests] : newRequests));
      setHasMore(newRequests.length === PAGE_SIZE);
      setLastCreatedAt(response.data.at(-1)?.createdAt?.toString());
    } catch (e) {
      setError((e as Error).message ?? "Failed to load sent requests");
    } finally {
      setLoading(false);
    }
  }, [lastCreatedAt]);

  function removeRequest(friendshipId: string) {
    setSentRequests(prev => prev.filter(r => r.id !== friendshipId));
  }

  useEffect(() => {
    fetchSentRequests();
  }, [fetchSentRequests]);

  return {
    sentRequests,
    loading,
    error,
    hasMore,
    refetch: () => fetchSentRequests(false),
    fetchMore: () => fetchSentRequests(true),
    removeRequest
  };
}

export function useFriends() {
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastCreatedAt, setLastCreatedAt] = useState<string>();

  const fetchFriends = useCallback(async (append = false) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.friendship.getFriendships(PAGE_SIZE, append ? lastCreatedAt : undefined);
      const newFriends = mapReadFriendshipDtos(response.data);
      setFriends(prev => (append ? [...prev, ...newFriends] : newFriends));
      setHasMore(newFriends.length === PAGE_SIZE);
      setLastCreatedAt(response.data.at(-1)?.createdAt?.toString());
    } catch (e) {
      setError((e as Error).message ?? "Failed to load friends");
    } finally {
      setLoading(false);
    }
  }, [lastCreatedAt]);

  function removeFriend(friendshipId: string) {
    setFriends(prev => prev.filter(f => f.id !== friendshipId));
  }

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  return {
    friends,
    loading,
    error,
    hasMore,
    refetch: () => fetchFriends(false),
    fetchMore: () => fetchFriends(true),
    removeFriend
  };
}
