import { ChatType, ChatRole, MessageStatus } from './enums';
export { ChatType, ChatRole, MessageStatus } from './enums';

// Message types matching backend
export interface Message {
  id: string;
  createdAt: Date;
  text: string;
  userId: string;
  chatId: string;
  status: MessageStatus;
}

// Extended message type with optional localId for optimistic UI updates
export interface MessageWithLocalId extends Message {
    localId?: string; // Optional local ID for optimistic UI updates
}

// (Removed legacy CreateMessageRequest interface)

// Chat types matching backend
export interface Chat {
  id: string;
  title: string;
  isPrivate: boolean;
  chatType: ChatType;
  isMuted: boolean;
  chatRole: ChatRole;
  createdAt: Date;
}

// User types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  createdAt: Date;
}

// Extended types for UI
export interface ChatWithLastMessage extends Chat {
  lastMessage?: Message;
  unreadCount: number;
  isOnline: boolean;
}
