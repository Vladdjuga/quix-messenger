import * as signalR from '@microsoft/signalr';
import { getToken } from '@/app/api/token';
import { refreshAuthTokenUseCase } from '@/lib/usecases/auth/refreshTokenUseCase';

let presenceConnection: signalR.HubConnection | null = null;
let isRefreshing = false;

const PRESENCE_HUB_URL = process.env.NEXT_PUBLIC_API_URL 
    ? `${process.env.NEXT_PUBLIC_API_URL}/presence`
    : 'http://localhost:6001/presence';

export const initPresenceConnection = async (): Promise<signalR.HubConnection> => {
    if (presenceConnection && presenceConnection.state === signalR.HubConnectionState.Connected) {
        return presenceConnection;
    }

    if (presenceConnection) {
        await presenceConnection.stop();
    }

    const token = getToken();
    
    presenceConnection = new signalR.HubConnectionBuilder()
        .withUrl(PRESENCE_HUB_URL, {
            accessTokenFactory: () => token || '',
        })
        .withAutomaticReconnect({
            nextRetryDelayInMilliseconds: (retryContext) => {
                // Exponential backoff: 0s, 2s, 10s, 30s
                if (retryContext.elapsedMilliseconds < 60000) {
                    return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
                }
                return null; // Stop reconnecting after 1 minute
            }
        })
        .configureLogging(signalR.LogLevel.Information)
        .build();

    // Handle reconnection events
    presenceConnection.onreconnecting((error) => {
        console.warn('PresenceHub reconnecting...', error);
    });

    presenceConnection.onreconnected((connectionId) => {
        console.log('PresenceHub reconnected:', connectionId);
    });

    presenceConnection.onclose(async (error) => {
        console.error('PresenceHub connection closed:', error);
        
        // Try to refresh token and reconnect if it was an auth error
        if (error && error.message?.includes('401')) {
            if (!isRefreshing) {
                isRefreshing = true;
                try {
                    const newToken = await refreshAuthTokenUseCase();
                    if (newToken) {
                        // Recreate connection with new token
                        await initPresenceConnection();
                    }
                } finally {
                    isRefreshing = false;
                }
            }
        }
    });

    try {
        await presenceConnection.start();
        console.log('PresenceHub connected:', presenceConnection.connectionId);
    } catch (error) {
        console.error('Failed to start PresenceHub connection:', error);
        throw error;
    }

    return presenceConnection;
};

export const getPresenceConnection = (): signalR.HubConnection => {
    if (!presenceConnection) {
        throw new Error('PresenceHub connection not initialized. Call initPresenceConnection() first.');
    }
    return presenceConnection;
};

export const stopPresenceConnection = async (): Promise<void> => {
    if (presenceConnection) {
        await presenceConnection.stop();
        presenceConnection = null;
    }
};

export const ensurePresenceConnected = async (): Promise<signalR.HubConnection> => {
    if (!presenceConnection || presenceConnection.state !== signalR.HubConnectionState.Connected) {
        return await initPresenceConnection();
    }
    return presenceConnection;
};
