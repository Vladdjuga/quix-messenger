import { ChatWithLastMessage, Message, ChatType, ChatRole, MessageStatus } from '@/lib/types';

// Temporary mock data - replace with real API implementation
export const mockChats: ChatWithLastMessage[] = [
  {
    id: '1',
    title: 'John Doe',
    isPrivate: true,
    chatType: ChatType.Direct,
    isMuted: false,
    chatRole: ChatRole.User,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    lastMessage: {
      id: '1',
      sentAt: new Date(Date.now() - 1000 * 60 * 30),
      receivedAt: new Date(Date.now() - 1000 * 60 * 29),
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
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    lastMessage: {
      id: '2',
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 30),
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
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    lastMessage: {
      id: '3',
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
      receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 5 + 1000 * 10),
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
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    lastMessage: {
      id: '4',
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60),
      text: 'See you tomorrow!',
      userId: '5',
      chatId: '4',
      status: MessageStatus.Read
    },
    unreadCount: 0,
    isOnline: false
  }
];

export const mockMessages: { [chatId: string]: Message[] } = {
  '1': [
    {
      id: '1',
      sentAt: new Date(Date.now() - 1000 * 60 * 60),
      receivedAt: new Date(Date.now() - 1000 * 60 * 60 + 1000 * 5),
      text: 'Hey there! How are you doing?',
      userId: '2',
      chatId: '1',
      status: MessageStatus.Read
    },
    {
      id: '2',
      sentAt: new Date(Date.now() - 1000 * 60 * 45),
      receivedAt: new Date(Date.now() - 1000 * 60 * 45 + 1000 * 3),
      text: 'I\'m doing great! Just working on some new features.',
      userId: 'current-user',
      chatId: '1',
      status: MessageStatus.Read
    },
    {
      id: '3',
      sentAt: new Date(Date.now() - 1000 * 60 * 30),
      receivedAt: new Date(Date.now() - 1000 * 60 * 29),
      text: 'That sounds awesome! What kind of features?',
      userId: '2',
      chatId: '1',
      status: MessageStatus.Delivered
    }
  ],
  '2': [
    {
      id: '4',
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
      receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 3 + 1000 * 2),
      text: 'Hey! Thanks for helping me with the project yesterday.',
      userId: '3',
      chatId: '2',
      status: MessageStatus.Read
    },
    {
      id: '5',
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 30),
      text: 'No problem at all! Glad I could help.',
      userId: 'current-user',
      chatId: '2',
      status: MessageStatus.Read
    }
  ]
};

// TODO: Replace with real API implementation
export async function fetchChats(): Promise<ChatWithLastMessage[]> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockChats;
}

// TODO: Replace with real API implementation
export async function fetchMessages(chatId: string): Promise<Message[]> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockMessages[chatId] || [];
}

// TODO: Replace with real API implementation
export async function sendMessage(chatId: string, content: string, userId: string): Promise<Message> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const newMessage: Message = {
    id: Date.now().toString(),
    sentAt: new Date(),
    receivedAt: new Date(),
    text: content,
    userId,
    chatId,
    status: MessageStatus.Sent
  };
  
  console.log('Sending message:', { chatId, content });
  return newMessage;
}
