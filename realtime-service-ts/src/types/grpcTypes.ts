// Chat Service Types
export interface UserChatExistsRequest {
    userId: string;
    chatId: string;
}

export interface UserChatExistsResponse {
    exists: boolean;
}

// Messenger Service Types
export enum MessageStatus {
    Read = 0,
    Sent = 1,
    Delivered = 2,
    Modified = 3,
}

export interface GetMessageRequest {
    userId: string;
    chatId: string;
    count: number;
}

export interface MessageResponse {
    id: string;
    sentAt: Date;
    receivedAt: Date;
    text: string;
    userId: string;
    chatId: string;
    status: MessageStatus;
}

export interface GetMessageResponse {
    messages: MessageResponse[];
}

export interface SendMessageRequest {
    sentAt: Date;
    text: string;
    userId: string;
    chatId: string;
}

export interface SendMessageResponse {
    id: string;
    success: boolean;
}