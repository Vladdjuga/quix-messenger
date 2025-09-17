import { api } from '@/app/api';
import { Message } from '@/lib/types';
import { mapReadMessageDtos } from '@/lib/mappers/messageMapper';

// Service endpoints for messaging
// username identifies a direct chat; adjust if backend uses chatId

export async function getMessages(username: string): Promise<Message[]> {
  const resp = await api.messages.list(username);
  return mapReadMessageDtos(resp.data);
}

// Optionally expose raw DTO methods if needed later
export const rawMessagesApi = {
  list: (username: string) => api.messages.list(username)
};
