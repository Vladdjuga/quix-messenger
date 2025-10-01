import { ReadChatDto } from "@/lib/dto/chat/ReadChatDto";
import { ChatRole, ChatType, ChatWithLastMessage, Message } from "@/lib/types";
import { mapReadMessageDto } from "./messageMapper";

export function mapReadChatWithLastMessageDto(dto: ReadChatDto): ChatWithLastMessage {
  const lastMessage: Message | undefined = dto.lastMessage ? mapReadMessageDto(dto.lastMessage) : undefined;
  return {
    id: dto.id,
    title: dto.title,
    chatType: (dto.chatType as ChatType),
    isMuted: dto.isMuted,
    chatRole: (dto.chatRole as ChatRole),
    createdAt: new Date(dto.createdAt),
    participants: dto.participants?.map(u => ({
      id: u.id,
      avatarUrl: u.avatarUrl,
      username: u.username,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      dateOfBirth: new Date(u.dateOfBirth),
      createdAt: new Date(u.createdAt),
    })),
    lastMessage,
    unreadCount: dto.unreadCount ?? 0,
    isOnline: dto.isOnline ?? false,
  };
}

export function mapReadChatWithLastMessageDtos(dtos: ReadChatDto[]): ChatWithLastMessage[] {
  return dtos.map(mapReadChatWithLastMessageDto);
}
