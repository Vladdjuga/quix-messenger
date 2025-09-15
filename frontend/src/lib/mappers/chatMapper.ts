import { ReadChatWithLastMessageDto } from "@/lib/dto/ReadChatWithLastMessageDto";
import { ChatRole, ChatType, ChatWithLastMessage, Message } from "@/lib/types";
import { mapReadMessageDto } from "./messageMapper";

export function mapReadChatWithLastMessageDto(dto: ReadChatWithLastMessageDto): ChatWithLastMessage {
  const lastMessage: Message | undefined = dto.lastMessage ? mapReadMessageDto(dto.lastMessage) : undefined;
  return {
    id: dto.id,
    title: dto.title,
    isPrivate: dto.isPrivate,
    chatType: (dto.chatType as ChatType),
    isMuted: dto.isMuted,
    chatRole: (dto.chatRole as ChatRole),
    createdAt: new Date(dto.createdAt),
    lastMessage,
    unreadCount: dto.unreadCount ?? 0,
    isOnline: dto.isOnline ?? false,
  };
}

export function mapReadChatWithLastMessageDtos(dtos: ReadChatWithLastMessageDto[]): ChatWithLastMessage[] {
  return dtos.map(mapReadChatWithLastMessageDto);
}
