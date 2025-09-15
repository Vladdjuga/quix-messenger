import apiClient, { getTyped } from '@/app/api/axios';
import { ReadMessageDto } from '@/lib/dto/ReadMessageDto';
import { Message } from '@/lib/types';
import { mapReadMessageDtos } from '@/lib/mappers/messageMapper';

// Service endpoints for messaging
// username identifies a direct chat; adjust if backend uses chatId

export async function getMessages(username: string): Promise<Message[]> {
  return getTyped<Message[]>(`/chats/${encodeURIComponent(username)}/messages`, {
    parse: (data: unknown) => mapReadMessageDtos(data as ReadMessageDto[])
  });
}

// Optionally expose raw DTO methods if needed later
export const rawMessagesApi = {
  list: (username: string) => apiClient.get<ReadMessageDto[]>(`/chats/${encodeURIComponent(username)}/messages`)
};
