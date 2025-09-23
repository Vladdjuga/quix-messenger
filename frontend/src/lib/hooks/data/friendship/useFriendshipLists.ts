import { useState, useEffect } from 'react';
import type { Friendship } from "@/lib/types";
import { api } from "@/app/api";
import { mapReadFriendshipDtos } from "@/lib/mappers/friendshipMapper";

const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE ?? 20);

export function useFriendRequests() {
  const [requests, setRequests] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchRequests() {
    try {
      setLoading(true);
      setError(null);
  const response = await api.friendship.getFriendRequests("", PAGE_SIZE);
  setRequests(mapReadFriendshipDtos(response.data));
    } catch (e) {
      setError((e as Error).message ?? "Failed to load friend requests");
    } finally {
      setLoading(false);
    }
  }

  function removeRequest(friendshipId: string) {
    setRequests(prev => prev.filter(r => r.id !== friendshipId));
  }

  useEffect(() => {
    fetchRequests();
  }, []);

  return {
    requests,
    loading,
    error,
    refetch: fetchRequests,
    removeRequest
  };
}

export function useSentRequests() {
  const [sentRequests, setSentRequests] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchSentRequests() {
    try {
      setLoading(true);
      setError(null);
  const response = await api.friendship.getSentRequests("", PAGE_SIZE);
  setSentRequests(mapReadFriendshipDtos(response.data));
    } catch (e) {
      setError((e as Error).message ?? "Failed to load sent requests");
    } finally {
      setLoading(false);
    }
  }

  function removeRequest(friendshipId: string) {
    setSentRequests(prev => prev.filter(r => r.id !== friendshipId));
  }

  useEffect(() => {
    fetchSentRequests();
  }, []);

  return {
    sentRequests,
    loading,
    error,
    refetch: fetchSentRequests,
    removeRequest
  };
}

export function useFriends() {
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchFriends() {
    try {
      setLoading(true);
      setError(null);
  const response = await api.friendship.getFriendships(PAGE_SIZE);
  setFriends(mapReadFriendshipDtos(response.data));
    } catch (e) {
      setError((e as Error).message ?? "Failed to load friends");
    } finally {
      setLoading(false);
    }
  }

  function removeFriend(friendshipId: string) {
    setFriends(prev => prev.filter(f => f.id !== friendshipId));
  }

  useEffect(() => {
    fetchFriends();
  }, []);

  return {
    friends,
    loading,
    error,
    refetch: fetchFriends,
    removeFriend
  };
}
