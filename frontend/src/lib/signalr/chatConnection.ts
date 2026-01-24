import * as signalR from '@microsoft/signalr';
import { getToken } from '@/app/api/token';
import { refreshAuthTokenUseCase } from '@/lib/usecases/auth/refreshTokenUseCase';

let chatConnection: signalR.HubConnection | null = null;
let isRefreshing = false;

const CHAT_HUB_URL = process.env.NEXT_PUBLIC_API_URL 
    ? `${process.env.NEXT_PUBLIC_API_URL}/chat`
    : 'http://localhost:6001/chat';

export const initChatConnection = async (): Promise<signalR.HubConnection> => {
    if (chatConnection && chatConnection.state === signalR.HubConnectionState.Connected) {
        return chatConnection;
    }

    if (chatConnection) {
        await chatConnection.stop();
    }

    const token = getToken();
    
    chatConnection = new signalR.HubConnectionBuilder()
        .withUrl(CHAT_HUB_URL, {
            accessTokenFactory: () => token || '',
            skipNegotiation: true,
            transport: signalR.HttpTransportType.WebSockets,
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
    chatConnection.onreconnecting((error) => {
        console.warn('ChatHub reconnecting...', error);
    });

    chatConnection.onreconnected((connectionId) => {
        console.log('ChatHub reconnected:', connectionId);
    });

    chatConnection.onclose(async (error) => {
        console.error('ChatHub connection closed:', error);
        
        // Try to refresh token and reconnect if it was an auth error
        if (error && error.message?.includes('401')) {
            if (!isRefreshing) {
                isRefreshing = true;
                try {
                    const newToken = await refreshAuthTokenUseCase();
                    if (newToken) {
                        // Recreate connection with new token
                        await initChatConnection();
                    }
                } finally {
                    isRefreshing = false;
                }
            }
        }
    });

    try {
        await chatConnection.start();
        console.log('ChatHub connected:', chatConnection.connectionId);
    } catch (error) {
        console.error('Failed to start ChatHub connection:', error);
        throw error;
    }

    return chatConnection;
};

export const getChatConnection = (): signalR.HubConnection => {
    if (!chatConnection) {
        throw new Error('ChatHub connection not initialized. Call initChatConnection() first.');
    }
    return chatConnection;
};

export const stopChatConnection = async (): Promise<void> => {
    if (chatConnection) {
        await chatConnection.stop();
        chatConnection = null;
    }
};

export const ensureChatConnected = async (): Promise<signalR.HubConnection> => {
    if (!chatConnection || chatConnection.state !== signalR.HubConnectionState.Connected) {
        return await initChatConnection();
    }
    return chatConnection;
};
