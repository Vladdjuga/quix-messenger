'use client';

import React, { useState, useEffect } from 'react';
import ChatList from '@/components/chat/ChatList';
import ChatBox from '@/components/chat/ChatBox';
import { ChatWithLastMessage, Message } from '@/lib/types';
import { fetchChats, fetchMessages, sendMessage } from '@/lib/services/chatService';

const ChatPage = () => {
  const [chats, setChats] = useState<ChatWithLastMessage[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const chatData = await fetchChats();
      setChats(chatData);
      if (chatData.length > 0 && !selectedChatId) {
        setSelectedChatId(chatData[0].id);
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  useEffect(() => {
    if (selectedChatId) {
      loadMessages(selectedChatId);
    }
  }, [selectedChatId]);

  const loadMessages = async (chatId: string) => {
    try {
      setIsLoading(true);
      const messageData = await fetchMessages(chatId);
      setMessages(messageData);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedChatId) return;

    try {
      const newMessage = await sendMessage(selectedChatId, content, '1'); // TODO: Get current user ID from auth
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const selectedChat = chats.find(chat => chat.id === selectedChatId) || null;

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700">
        <ChatList 
          chats={chats} 
          selectedChatId={selectedChatId} 
          onChatSelect={handleChatSelect} 
        />
      </div>
      <div className="flex-1">
        {selectedChat ? (
          <ChatBox
            selectedChat={selectedChat}
            messages={messages}
            currentUserId="1" // TODO: Get current user ID from auth
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
