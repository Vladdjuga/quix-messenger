import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/app/api';

type UserPresence = {
  isOnline: boolean;
  lastSeenAt: string | null;
};

type UseUserPresenceReturn = {
  isOnline: boolean | null;
  lastSeenAt: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

// Hook to get user presence information including online status and last seen timestamp
export function useUserPresence(userId?: string | null): UseUserPresenceReturn {
  const [presence, setPresence] = useState<UserPresence>({ isOnline: false, lastSeenAt: null });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPresence = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.realtime.getUserPresence(userId);
      setPresence({
        isOnline: !!res.data?.isOnline,
        lastSeenAt: res.data?.lastSeenAt || null
      });
    } catch (e) {
      setError((e as Error).message ?? 'Failed to fetch user presence');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void fetchPresence();
  }, [fetchPresence]);

  const refetch = useCallback(async () => {
    await fetchPresence();
  }, [fetchPresence]);

  return useMemo(() => ({
    isOnline: presence.isOnline,
    lastSeenAt: presence.lastSeenAt,
    loading,
    error,
    refetch
  }), [presence.isOnline, presence.lastSeenAt, loading, error, refetch]);
}