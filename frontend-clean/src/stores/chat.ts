import { create } from 'zustand';
import { ChatWithLastMessage, Message } from '@/types';
import { getChats, getMessages, sendMessage } from '@/services/chat';

interface ChatState {
  chats: ChatWithLastMessage[];
  selectedChatId: string | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadChats: () => Promise<void>;
  selectChat: (chatId: string) => void;
  loadMessages: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, text: string) => Promise<void>;
  addMessage: (message: Message) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  selectedChatId: null,
  messages: [],
  isLoading: false,
  error: null,

  loadChats: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await getChats();
      
      if (response.success && response.data) {
        set({ 
          chats: response.data,
          isLoading: false 
        });
      } else {
        set({ 
          error: response.error || 'Failed to load chats',
          isLoading: false 
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load chats',
        isLoading: false,
      });
    }
  },

  selectChat: (chatId: string) => {
    set({ selectedChatId: chatId });
    get().loadMessages(chatId);
  },

  loadMessages: async (chatId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await getMessages(chatId);
      
      if (response.success && response.data) {
        set({ 
          messages: response.data,
          isLoading: false 
        });
      } else {
        set({ 
          error: response.error || 'Failed to load messages',
          isLoading: false 
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load messages',
        isLoading: false,
      });
    }
  },

  sendMessage: async (chatId: string, text: string) => {
    try {
      const response = await sendMessage(chatId, text);
      
      if (response.success && response.data) {
        // Add message to current messages
        const { messages } = get();
        set({ 
          messages: [...messages, response.data] 
        });
      } else {
        set({ 
          error: response.error || 'Failed to send message' 
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to send message',
      });
    }
  },

  addMessage: (message: Message) => {
    const { messages } = get();
    set({ 
      messages: [...messages, message] 
    });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },
}));
