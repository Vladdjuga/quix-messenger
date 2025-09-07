// Enums matching backend
export enum MessageStatus {
  Read = 1,
  Sent = 2,
  Delivered = 4,
  Modified = 8
}

export enum ChatType {
  Direct = 'Direct',
  Group = 'Group',
  Channel = 'Channel'
}

export enum ChatRole {
  Admin = 'Admin',
  Moderator = 'Moderator',
  User = 'User'
}

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

export interface CreateMessageRequest {
  text: string;
  userId: string;
  chatId: string;
}

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
