import { MessageStatus } from "@/lib/types";

export interface ReadChatWithLastMessageDto {
  id: string;
  title: string;
  isPrivate: boolean;
  chatType: string; // keep string for transport; map to ChatType
  isMuted: boolean;
  chatRole: string; // transport string
  createdAt: string; // ISO
  unreadCount?: number;
  isOnline?: boolean;
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
