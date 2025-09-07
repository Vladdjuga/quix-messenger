'use client';

import React, { useState, useEffect } from 'react';
import ChatList from '@/components/chat/ChatList';
import ChatBox from '@/components/chat/ChatBox';
import { ChatWithLastMessage, Message, ChatType, ChatRole, MessageStatus } from '@/lib/types';

// Mock data - replace with real API calls
const mockChats: ChatWithLastMessage[] = [
  {
    id: '1',
    title: 'John Doe',
    isPrivate: true,
    chatType: ChatType.Direct,
    isMuted: false,
    chatRole: ChatRole.User,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    lastMessage: {
      id: '1',
      sentAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      receivedAt: new Date(Date.now() - 1000 * 60 * 29), // 29 minutes ago
      text: 'Hey! How are you doing?',
      userId: '2',
      chatId: '1',
      status: MessageStatus.Delivered
    },
    unreadCount: 2,
    isOnline: true
  },
  {
    id: '2',
    title: 'Alice Smith',
    isPrivate: true,
    chatType: ChatType.Direct,
    isMuted: false,
    chatRole: ChatRole.User,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    lastMessage: {
      id: '2',
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 30), // 1h30m ago
      text: 'Thanks for the help yesterday!',
      userId: '3',
      chatId: '2',
      status: MessageStatus.Read
    },
    unreadCount: 0,
    isOnline: false
  },
  {
    id: '3',
    title: 'Development Team',
    isPrivate: false,
    chatType: ChatType.Group,
    isMuted: false,
    chatRole: ChatRole.Admin,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
    lastMessage: {
      id: '3',
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 5 + 1000 * 10), // 4h50m ago
      text: 'The new feature is ready for testing',
      userId: '4',
      chatId: '3',
      status: MessageStatus.Read
    },
    unreadCount: 5,
    isOnline: true
  },
  {
    id: '4',
    title: 'Sarah Johnson',
    isPrivate: true,
    chatType: ChatType.Direct,
    isMuted: false,
    chatRole: ChatRole.User,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
    lastMessage: {
      id: '4',
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60), // 23h ago
      text: 'See you tomorrow!',
      userId: '5',
      chatId: '4',
      status: MessageStatus.Read
    },
    unreadCount: 0,
    isOnline: false
  }
];

const mockMessages: { [chatId: string]: Message[] } = {
  '1': [
    {
      id: '1',
      sentAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      receivedAt: new Date(Date.now() - 1000 * 60 * 60 + 1000 * 5), // 55m ago
      text: 'Hey there! How are you doing?',
      userId: '2',
      chatId: '1',
      status: MessageStatus.Read
    },
    {
      id: '2',
      sentAt: new Date(Date.now() - 1000 * 60 * 50), // 50 minutes ago
      receivedAt: new Date(Date.now() - 1000 * 60 * 50 + 1000 * 2), // 49m50s ago
      text: 'Hi John! I\'m doing great, thanks for asking. How about you?',
      userId: 'current-user',
      chatId: '1',
      status: MessageStatus.Read
    },
    {
      id: '3',
      sentAt: new Date(Date.now() - 1000 * 60 * 40), // 40 minutes ago
      receivedAt: new Date(Date.now() - 1000 * 60 * 40 + 1000 * 3), // 39m57s ago
      text: 'I\'m good too! Are we still on for the meeting tomorrow?',
      userId: '2',
      chatId: '1',
      status: MessageStatus.Read
    },
    {
      id: '4',
      sentAt: new Date(Date.now() - 1000 * 60 * 35), // 35 minutes ago
      receivedAt: new Date(Date.now() - 1000 * 60 * 35 + 1000 * 1), // 34m59s ago
      text: 'Yes, absolutely! Looking forward to it.',
      userId: 'current-user',
      chatId: '1',
      status: MessageStatus.Read
    },
    {
      id: '5',
      sentAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      receivedAt: new Date(Date.now() - 1000 * 60 * 29), // 29 minutes ago
      text: 'Hey! How are you doing?',
      userId: '2',
      chatId: '1',
      status: MessageStatus.Delivered
    }
  ],
  '2': [
    {
      id: '6',
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 5), // 1h55m ago
      text: 'Thanks for the help yesterday!',
      userId: '3',
      chatId: '2',
      status: MessageStatus.Read
    },
    {
      id: '7',
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 5), // 1h55m ago
      receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 5 + 1000 * 2), // 1h54m58s ago
      text: 'You\'re welcome! Happy to help anytime.',
      userId: 'current-user',
      chatId: '2',
      status: MessageStatus.Read
    }
  ],
  '3': [
    {
      id: '8',
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 5 + 1000 * 10), // 4h50m ago
      text: 'The new feature is ready for testing',
      userId: '4',
      chatId: '3',
      status: MessageStatus.Read
    },
    {
      id: '9',
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 4 + 1000 * 5), // 3h55m ago
      text: 'Great! I\'ll start testing it now.',
      userId: '6',
      chatId: '3',
      status: MessageStatus.Read
    },
    {
      id: '10',
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 3 + 1000 * 2), // 2h59m58s ago
      text: 'I\'ll review the code changes this afternoon.',
      userId: 'current-user',
      chatId: '3',
      status: MessageStatus.Read
    }
  ],
  '4': [
    {
      id: '11',
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60), // 23h ago
      text: 'See you tomorrow!',
      userId: '5',
      chatId: '4',
      status: MessageStatus.Read
    }
  ]
};

const ChatPage: React.FC = () => {
  const [chats] = useState<ChatWithLastMessage[]>(mockChats);
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock current user ID
  const currentUserId = 'current-user';

  // Load messages when chat is selected
  useEffect(() => {
    if (selectedChatId) {
      setIsLoading(true);
      // Simulate API call delay
      setTimeout(() => {
        setMessages(mockMessages[selectedChatId] || []);
        setIsLoading(false);
      }, 500);
    } else {
      setMessages([]);
    }
  }, [selectedChatId]);

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  const handleSendMessage = (content: string) => {
    if (!selectedChatId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sentAt: new Date(),
      receivedAt: new Date(),
      text: content,
      userId: currentUserId,
      chatId: selectedChatId,
      status: MessageStatus.Sent
    };

    setMessages(prev => [...prev, newMessage]);

    // TODO: Send message to API
    console.log('Sending message:', { chatId: selectedChatId, content });
  };

  const selectedChat = chats.find(chat => chat.id === selectedChatId) || null;

  return (
    <div className="h-[calc(100vh-80px)] flex bg-gray-100">
      <ChatList
        chats={chats}
        selectedChatId={selectedChatId}
        onChatSelect={handleChatSelect}
      />
      <ChatBox
        selectedChat={selectedChat}
        messages={messages}
        currentUserId={currentUserId}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ChatPage;
