import { api } from '@/app/api';
import { Message } from '@/lib/types';
import { mapReadMessageDtos } from '@/lib/mappers/messageMapper';

// Fetch last N messages for a chat by id
export async function getLastMessagesByChatId(chatId: string, count: number = 50): Promise<Message[]> {
  const resp = await api.messages.last(chatId, count);
  return mapReadMessageDtos(resp.data);
}

// Fetch paginated messages by chat id with cursor
export async function getPaginatedMessages(chatId: string, lastCreatedAt: string, pageSize: number = 50): Promise<Message[]> {
  const resp = await api.messages.paginated(chatId, lastCreatedAt, pageSize);
  return mapReadMessageDtos(resp.data);
}

// Sending is handled via WebSocket only.
