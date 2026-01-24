import * as signalR from '@microsoft/signalr';
import { Message, MessageStatus } from '@/lib/types';

// DTOs matching backend SignalR payloads
export type NewMessageRealtimeDto = {
    senderId: string;
    message: MessageRealtimeDto;
};

export type MessageRealtimeDto = {
    id: string;
    chatId: string;
    text: string;
    createdAt: string;
    userId: string;
    status: number;
    attachments?: MessageAttachmentRealtimeDto[];
};

export type MessageAttachmentRealtimeDto = {
    id: string;
    name: string;
    contentType: string;
    size: number;
    url: string;
};

export type MessageEditedRealtimeDto = {
    senderId: string;
    message: MessageRealtimeDto;
};

export type MessageDeletedRealtimeDto = {
    senderId: string;
    messageId: string;
    chatId: string;
};

// Server methods (invoke)
export async function joinChat(connection: signalR.HubConnection, chatId: string): Promise<void> {
    try {
        await connection.invoke('JoinChat', chatId);
        console.log(`Joined chat: ${chatId}`);
    } catch (error) {
        console.error('Failed to join chat:', error);
    }
}

export async function leaveChat(connection: signalR.HubConnection, chatId: string): Promise<void> {
    try {
        await connection.invoke('LeaveChat', chatId);
        console.log(`Left chat: ${chatId}`);
    } catch (error) {
        console.error('Failed to leave chat:', error);
    }
}

export async function sendTyping(connection: signalR.HubConnection, chatId: string): Promise<void> {
    try {
        await connection.invoke('UserTyping', chatId);
    } catch (error) {
        console.error('Failed to send typing:', error);
    }
}

export async function sendStopTyping(connection: signalR.HubConnection, chatId: string): Promise<void> {
    try {
        await connection.invoke('UserStopTyping', chatId);
    } catch (error) {
        console.error('Failed to send stop typing:', error);
    }
}

// Client methods (listeners)
export function onNewMessage(
    connection: signalR.HubConnection,
    handler: (msg: Message) => void
): () => void {
    const listener = (payload: NewMessageRealtimeDto) => {
        try {
            const msgDto = payload.message;
            const msg: Message = {
                id: msgDto.id,
                chatId: msgDto.chatId,
                text: msgDto.text,
                userId: msgDto.userId,
                createdAt: new Date(msgDto.createdAt),
                status: (msgDto.status as MessageStatus) ?? MessageStatus.Delivered,
                attachments: msgDto.attachments?.map(a => ({
                    id: a.id,
                    name: a.name,
                    contentType: a.contentType,
                    size: a.size,
                    url: a.url,
                })) ?? [],
            };
            handler(msg);
        } catch (error) {
            console.error('Failed to parse NewMessage payload:', error);
        }
    };

    connection.on('NewMessage', listener);
    return () => connection.off('NewMessage', listener);
}

export function onMessageEdited(
    connection: signalR.HubConnection,
    handler: (msg: Message) => void
): () => void {
    const listener = (payload: MessageEditedRealtimeDto) => {
        try {
            const msgDto = payload.message;
            const msg: Message = {
                id: msgDto.id,
                chatId: msgDto.chatId,
                text: msgDto.text,
                userId: msgDto.userId,
                createdAt: new Date(msgDto.createdAt),
                status: (msgDto.status as MessageStatus) ?? MessageStatus.Modified,
                attachments: msgDto.attachments?.map(a => ({
                    id: a.id,
                    name: a.name,
                    contentType: a.contentType,
                    size: a.size,
                    url: a.url,
                })) ?? [],
            };
            handler(msg);
        } catch (error) {
            console.error('Failed to parse MessageEdited payload:', error);
        }
    };

    connection.on('MessageEdited', listener);
    return () => connection.off('MessageEdited', listener);
}

export function onMessageDeleted(
    connection: signalR.HubConnection,
    handler: (payload: { messageId: string; chatId: string; senderId: string }) => void
): () => void {
    const listener = (payload: MessageDeletedRealtimeDto) => {
        try {
            handler({
                messageId: payload.messageId,
                chatId: payload.chatId,
                senderId: payload.senderId,
            });
        } catch (error) {
            console.error('Failed to parse MessageDeleted payload:', error);
        }
    };

    connection.on('MessageDeleted', listener);
    return () => connection.off('MessageDeleted', listener);
}

export function onUserTyping(
    connection: signalR.HubConnection,
    handler: (payload: { chatId: string; userId: string; username: string }) => void
): () => void {
    const listener = (chatId: string, userId: string, username: string) => {
        try {
            handler({ chatId, userId, username });
        } catch (error) {
            console.error('Failed to parse UserTyping payload:', error);
        }
    };

    connection.on('UserTyping', listener);
    return () => connection.off('UserTyping', listener);
}

export function onUserStopTyping(
    connection: signalR.HubConnection,
    handler: (payload: { chatId: string; userId: string }) => void
): () => void {
    const listener = (chatId: string, userId: string) => {
        try {
            handler({ chatId, userId });
        } catch (error) {
            console.error('Failed to parse UserStopTyping payload:', error);
        }
    };

    connection.on('UserStopTyping', listener);
    return () => connection.off('UserStopTyping', listener);
}
