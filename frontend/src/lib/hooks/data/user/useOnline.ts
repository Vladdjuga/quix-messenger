import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/app/api';

type UseOnlineReturn = {
  isOnline: boolean | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

// Minimal presence hook: one-shot fetch on mount/when userId changes, with manual refetch.
export function useOnline(userId?: string | null): UseOnlineReturn {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOnce = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.realtime.isUserOnline(userId);
      setIsOnline(!!res.data?.isOnline);
    } catch (e) {
      setError((e as Error).message ?? 'Failed to fetch online status');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void fetchOnce();
  }, [fetchOnce]);

  const refetch = useCallback(async () => {
    await fetchOnce();
  }, [fetchOnce]);

  return useMemo(() => ({ isOnline, loading, error, refetch }), [error, isOnline, loading, refetch]);
}
