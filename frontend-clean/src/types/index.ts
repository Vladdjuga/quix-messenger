// Core types for the messenger app
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  createdAt: Date;
}

export interface Message {
  id: string;
  sentAt: Date;
  receivedAt: Date;
  text: string;
  userId: string;
  chatId: string;
  status: MessageStatus;
}

export interface Chat {
  id: string;
  title: string;
  isPrivate: boolean;
  chatType: ChatType;
  isMuted: boolean;
  chatRole: ChatRole;
  createdAt: Date;
}

export interface ChatWithLastMessage extends Chat {
  lastMessage?: Message;
  unreadCount: number;
  isOnline: boolean;
}

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

// API Types
export interface LoginRequest {
  identity: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  success: boolean;
}
