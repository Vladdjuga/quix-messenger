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

export interface SendMessageRequest {
    sentAt: Date;
    text: string;
    chatId: string;
}

export interface SendMessageResponse {
    id: string;
    success: boolean;
}