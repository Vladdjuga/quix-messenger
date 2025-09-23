import { useEffect, useMemo } from 'react';
import { useUserPresence } from './useUserPresence';

type UseUserPresencePollingOptions = {
  intervalMs?: number; // default 10000
  enabled?: boolean;   // default true
  immediate?: boolean; // default true
};

export function useUserPresencePolling(userId?: string | null, options: UseUserPresencePollingOptions = {}) {
  const { intervalMs = 10000, enabled = true, immediate = true } = options;
  const { isOnline, lastSeenAt, loading, error, refetch } = useUserPresence(userId);

  useEffect(() => {
    if (!enabled || !userId) return;

    let timer: ReturnType<typeof setInterval> | null = null;
    if (immediate) void refetch();
    if (intervalMs > 0) {
      timer = setInterval(() => { void refetch(); }, intervalMs);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [enabled, immediate, intervalMs, refetch, userId]);

  return useMemo(() => ({ 
    isOnline, 
    lastSeenAt, 
    loading, 
    error, 
    refetch 
  }), [isOnline, lastSeenAt, loading, error, refetch]);
}