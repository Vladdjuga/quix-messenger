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
    Read = 1,
    Sent = 2,
    Delivered = 4,
    Modified = 8,
}

export interface SendMessageRequest {
    createdAt: Date;
    text: string;
    chatId: string;
}

export interface SendMessageResponse {
    id: string;
    success: boolean;
}