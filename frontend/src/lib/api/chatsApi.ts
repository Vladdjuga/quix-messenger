import { getTyped } from '@/app/api/axios';
import { ChatWithLastMessage } from '@/lib/types';
import { ReadChatWithLastMessageDto } from '@/lib/dto/ReadChatWithLastMessageDto';
import { mapReadChatWithLastMessageDtos } from '@/lib/mappers/chatMapper';

export async function getChats(): Promise<ChatWithLastMessage[]> {
  return getTyped<ChatWithLastMessage[]>(`/chats`, {
    parse: (data: unknown) => mapReadChatWithLastMessageDtos(data as ReadChatWithLastMessageDto[])
  });
}
