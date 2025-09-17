import { api } from '@/app/api';
import { ChatWithLastMessage } from '@/lib/types';
import { mapReadChatWithLastMessageDtos } from '@/lib/mappers/chatMapper';

export async function getChats(): Promise<ChatWithLastMessage[]> {
  const resp = await api.chats.list();
  return mapReadChatWithLastMessageDtos(resp.data);
}
