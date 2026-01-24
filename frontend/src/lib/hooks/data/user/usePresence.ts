import { useContext, useEffect, useMemo, useState } from 'react';
import { PresenceContext } from '@/lib/contexts/PresenceContext';
import { onUserOffline, onUserOnline, subscribeToUsers } from '@/lib/signalr/presenceUseCases';
import * as signalR from '@microsoft/signalr';

type UsePresenceOptions = {
    userIds: string[]; // List of user IDs to track (e.g., friends)
    enabled?: boolean; // Default true
};

type UsePresenceReturn = {
    onlineStatus: Record<string, boolean>; // userId -> isOnline
    loading: boolean;
    error: string | null;
};

/**
 * Hook to track presence of multiple users in real-time via SignalR
 * Automatically subscribes to users and listens for online/offline events
 */
export function usePresence(options: UsePresenceOptions): UsePresenceReturn {
    const { userIds, enabled = true } = options;
    const connection = useContext(PresenceContext);
    const [onlineStatus, setOnlineStatus] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const userIdsKey = useMemo(() => {
        return [...userIds].sort().join(',');
    }, [userIds]);

    useEffect(() => {
        // Проверяем connection.state, чтобы не пытаться слать в разорванное соединение
        if (!connection || !enabled || userIds.length === 0 || connection.state !== signalR.HubConnectionState.Connected) {
            // Если мы не можем подписаться, можно сбросить loading,
            // но аккуратно, чтобы не мерцало.
            if (userIds.length === 0) setLoading(false);
            return;
        }

        let isMounted = true; // Флаг для предотвращения set state на размонтированном компоненте
        setLoading(true);
        setError(null);

        const subscribe = async () => {
            try {
                const initialStatus = await subscribeToUsers(connection, userIds);
                if (isMounted) {
                    setOnlineStatus(initialStatus);
                }
            } catch (e) {
                if (isMounted) {
                    setError((e as Error).message ?? 'Failed to subscribe');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        subscribe();

        return () => {
            isMounted = false;
        };
        // В зависимостях используем КЛЮЧ, а не сам массив или его длину
    }, [connection, enabled, userIdsKey]);

    useEffect(() => {
        if (!connection || !enabled || connection.state !== signalR.HubConnectionState.Connected) return;

        const offUserOnline = onUserOnline(connection, (userId) => {
            setOnlineStatus(prev => ({ ...prev, [userId]: true }));
        });

        const offUserOffline = onUserOffline(connection, (userId) => {
            setOnlineStatus(prev => ({ ...prev, [userId]: false }));
        });

        return () => {
            offUserOnline?.();
            offUserOffline?.();
        };
    }, [connection, enabled]);

    return useMemo(() => ({
        onlineStatus,
        loading,
        error
    }), [onlineStatus, loading, error]);
}

/**
 * Simplified hook for single user presence
 */
export function useUserPresence(userId?: string | null): {
    isOnline: boolean;
    loading: boolean;
    error: string | null;
} {
    // Memoize the array to prevent recreation on every render
    const userIds = useMemo(() => userId ? [userId] : [], [userId]);
    
    const { onlineStatus, loading, error } = usePresence({
        userIds,
        enabled: !!userId
    });

    return useMemo(() => ({
        isOnline: userId ? (onlineStatus[userId] ?? false) : false,
        loading,
        error
    }), [userId, onlineStatus, loading, error]);
}
