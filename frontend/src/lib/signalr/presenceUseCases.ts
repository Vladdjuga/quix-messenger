import * as signalR from '@microsoft/signalr';

// DTOs matching backend SignalR payloads
export type OnlineUserDto = {
    userId: string;
    username: string;
    connectedAt: string;
};

// Server methods (invoke)
export async function subscribeToUsers(
    connection: signalR.HubConnection,
    userIds: string[]
): Promise<Record<string, boolean>> {
    try {
        const result = await connection.invoke<Record<string, boolean>>('SubscribeToUsers', userIds);
        console.log(`Subscribed to ${userIds.length} users' presence`);
        return result;
    } catch (error) {
        console.error('Failed to subscribe to users:', error);
        return {};
    }
}

export async function getOnlineUsers(connection: signalR.HubConnection): Promise<void> {
    try {
        await connection.invoke('GetOnlineUsers');
        console.log('Requested online users list');
    } catch (error) {
        console.error('Failed to get online users:', error);
    }
}

// Client methods (listeners)
export function onUserOnline(
    connection: signalR.HubConnection,
    handler: (userId: string, username: string) => void
): () => void {
    const listener = (userId: string, username: string) => {
        try {
            handler(userId, username);
        } catch (error) {
            console.error('Failed to handle UserOnline event:', error);
        }
    };

    connection.on('UserOnline', listener);
    return () => connection.off('UserOnline', listener);
}

export function onUserOffline(
    connection: signalR.HubConnection,
    handler: (userId: string, username: string) => void
): () => void {
    const listener = (userId: string, username: string) => {
        try {
            handler(userId, username);
        } catch (error) {
            console.error('Failed to handle UserOffline event:', error);
        }
    };

    connection.on('UserOffline', listener);
    return () => connection.off('UserOffline', listener);
}

export function onOnlineUsers(
    connection: signalR.HubConnection,
    handler: (users: OnlineUserDto[]) => void
): () => void {
    const listener = (users: OnlineUserDto[]) => {
        try {
            handler(users);
        } catch (error) {
            console.error('Failed to handle OnlineUsers event:', error);
        }
    };

    connection.on('OnlineUsers', listener);
    return () => connection.off('OnlineUsers', listener);
}
