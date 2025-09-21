import { useEffect, useMemo } from 'react';
import { useOnline } from './useOnline';

type UseOnlinePollingOptions = {
  intervalMs?: number; // default 10000
  enabled?: boolean;   // default true
  immediate?: boolean; // default true
};

export function useOnlinePolling(userId?: string | null, options: UseOnlinePollingOptions = {}) {
  const { intervalMs = 10000, enabled = true, immediate = true } = options;
  const { isOnline, loading, error, refetch } = useOnline(userId);

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

  return useMemo(() => ({ isOnline, loading, error, refetch }), [isOnline, loading, error, refetch]);
}
