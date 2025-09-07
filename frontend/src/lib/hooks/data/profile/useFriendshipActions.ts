import { useState } from 'react';
import { api } from "@/app/api";

export function useFriendshipActions() {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendFriendRequest(username: string) {
    setSending(true);
    setError(null);
    try {
      await api.friendship.requestFriendship(username);
      return { success: true };
    } catch (e) {
      const errorMessage = (e as Error).message ?? "Failed to send friend request";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSending(false);
    }
  }

  async function acceptFriendRequest(friendshipId: string) {
    setSending(true);
    setError(null);
    try {
      await api.friendship.acceptFriendship(friendshipId);
      return { success: true };
    } catch (e) {
      const errorMessage = (e as Error).message ?? "Failed to accept friend request";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSending(false);
    }
  }

  async function cancelFriendRequest(friendshipId: string) {
    setSending(true);
    setError(null);
    try {
      await api.friendship.cancelFriendRequest(friendshipId);
      return { success: true };
    } catch (e) {
      const errorMessage = (e as Error).message ?? "Failed to cancel friend request";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSending(false);
    }
  }

  async function rejectFriendRequest(friendshipId: string) {
    setSending(true);
    setError(null);
    try {
      await api.friendship.rejectFriendRequest(friendshipId);
      return { success: true };
    } catch (e) {
      const errorMessage = (e as Error).message ?? "Failed to reject friend request";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSending(false);
    }
  }

  return {
    sending,
    error,
    sendFriendRequest,
    acceptFriendRequest,
    cancelFriendRequest,
    rejectFriendRequest,
    clearError: () => setError(null)
  };
}
