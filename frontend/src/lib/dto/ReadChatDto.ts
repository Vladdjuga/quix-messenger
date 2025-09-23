import { MessageStatus } from "@/lib/types";

export interface ReadChatDto {
  id: string;
  title: string;
  isPrivate: boolean;
  chatType: string; // keep string for transport; map to ChatType
  isMuted: boolean;
  chatRole: string; // transport string
  createdAt: string; // ISO
  unreadCount?: number;
  isOnline?: boolean;
  participants?: {
    id: string;
    avatarUrl: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string | Date;
    createdAt: string | Date;
  }[];
  lastMessage?: {
    id: string;
    text: string;
    userId: string;
    chatId: string;
    status: MessageStatus | number;
    createdAt: string;
    receivedAt: string;
  };
}
