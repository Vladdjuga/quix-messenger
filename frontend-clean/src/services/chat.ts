import { Chat, ChatWithLastMessage, Message, ApiResponse } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Request failed',
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// Chat API functions
export async function getChats() {
  return apiRequest<ChatWithLastMessage[]>('/chats');
}

export async function getMessages(chatId: string) {
  return apiRequest<Message[]>(`/chats/${chatId}/messages`);
}

export async function sendMessage(chatId: string, text: string) {
  return apiRequest<Message>(`/chats/${chatId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

export async function createChat(title: string, isPrivate: boolean) {
  return apiRequest<Chat>('/chats', {
    method: 'POST',
    body: JSON.stringify({ title, isPrivate }),
  });
}
