import apiClient, { getTyped, postTyped } from '@/app/api/axios';
import { ReadMessageDto } from '@/lib/dto/ReadMessageDto';
import { SendMessageDto } from '@/lib/dto/SendMessageDto';
import { Message } from '@/lib/types';
import { mapReadMessageDtos, mapReadMessageDto } from '@/lib/mappers/messageMapper';

// Service endpoints for messaging
// username identifies a direct chat; adjust if backend uses chatId

export async function getMessages(username: string): Promise<Message[]> {
  return getTyped<Message[]>(`/chats/${encodeURIComponent(username)}/messages`, {
    parse: (data: unknown) => mapReadMessageDtos(data as ReadMessageDto[])
  });
}

export async function sendMessage(username: string, chatId: string, text: string): Promise<Message> {
  const body: SendMessageDto = { chatId, text };
  return postTyped<SendMessageDto, Message>(`/chats/${encodeURIComponent(username)}/messages`, body, {
    parse: (data: unknown) => mapReadMessageDto(data as ReadMessageDto)
  });
}

// Optionally expose raw DTO methods if needed later
export const rawMessagesApi = {
  list: (username: string) => apiClient.get<ReadMessageDto[]>(`/chats/${encodeURIComponent(username)}/messages`),
  create: (username: string, text: string) => apiClient.post<ReadMessageDto>(`/chats/${encodeURIComponent(username)}/messages`, { text })
};
