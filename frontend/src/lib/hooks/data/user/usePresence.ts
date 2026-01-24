import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
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

    const subscribe = useCallback(async () => {
        if (!connection || !enabled || userIds.length === 0 || connection.state !== signalR.HubConnectionState.Connected) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Subscribe to users and get initial online status
            const initialStatus = await subscribeToUsers(connection, userIds);
            setOnlineStatus(initialStatus);
        } catch (e) {
            setError((e as Error).message ?? 'Failed to subscribe to presence');
        } finally {
            setLoading(false);
        }
    }, [connection, enabled, userIds]);

    // Subscribe on mount or when userIds change
    useEffect(() => {
        subscribe();
    }, [subscribe]);

    // Listen for real-time presence updates
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
    const { onlineStatus, loading, error } = usePresence({
        userIds: userId ? [userId] : [],
        enabled: !!userId
    });

    return useMemo(() => ({
        isOnline: userId ? (onlineStatus[userId] ?? false) : false,
        loading,
        error
    }), [userId, onlineStatus, loading, error]);
}
