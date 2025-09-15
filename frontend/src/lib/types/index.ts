import { ChatType, ChatRole, MessageStatus } from './enums';
export { ChatType, ChatRole, MessageStatus } from './enums';

// Message types matching backend
export interface Message {
  id: string;
  sentAt: Date;
  receivedAt: Date;
  text: string;
  userId: string;
  chatId: string;
  status: MessageStatus;
}

// Prefer DTOs in dto folder; keep legacy CreateMessageRequest for backward compatibility if still imported.
export interface CreateMessageRequest { text: string; userId: string; chatId: string; }

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
