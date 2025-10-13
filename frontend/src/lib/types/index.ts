import {ChatType, ChatRole, MessageStatus, UserStatus} from './enums';

export {ChatType, ChatRole, MessageStatus} from './enums';

export interface MessageAttachment {
    id: string;
    name: string;
    contentType: string;
    size: number;
    url: string;
}

// Message types matching backend
export interface Message {
    id: string;
    createdAt: Date;
    text: string;
    userId: string;
    chatId: string;
    status: MessageStatus;
    attachments?: MessageAttachment[];
}

// Participant type used in chats
export interface Participant {
    id: string;
    avatarUrl: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    createdAt: Date;
}

// (Removed legacy CreateMessageRequest interface)

// Chat types matching backend
export interface Chat {
    id: string;
    title: string;
    chatType: ChatType;
    isMuted: boolean;
    chatRole: ChatRole;
    createdAt: Date;
    avatarUrl?: string;
    participants?: Participant[];
}

// Extended types for UI
export interface ChatWithLastMessage extends Chat {
    lastMessage?: Message;
    unreadCount: number;
    isOnline: boolean;
}

// User domain type used across the app (mapped from DTO at API boundary)
export interface User {
    id: string;
    avatarUrl: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    createdAt: Date;
    // Relationship to current user (available in contexts like search/profile)
    relationshipStatus?: UserStatus;
    friendshipId?: string;
    privateChatId?: string;
}

// Friendship domain type
import type {FriendshipStatus} from './enums';

export interface Friendship {
    id: string;
    user: User; // the "other" user
    status: FriendshipStatus;
    privateChatId?: string;
    createdAt: Date;
}
