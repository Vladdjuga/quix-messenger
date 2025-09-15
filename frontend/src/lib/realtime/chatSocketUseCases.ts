import { Socket } from 'socket.io-client';
import { Message, MessageStatus } from '@/lib/types';

export type NewMessagePayload = {
  senderId: string;
  message: {
    id?: string;
    chatId: string;
    text: string;
    sentAt?: string | Date;
    userId?: string;
    status?: number;
  }
};

export async function joinChat(socket: Socket | null, chatId: string): Promise<void> {
  if (!socket) return;
  socket.emit('joinChat', chatId);
}

export async function leaveChat(socket: Socket | null, chatId: string): Promise<void> {
  if (!socket) return;
  socket.emit('leaveChat', chatId);
}

export async function sendChatMessage(socket: Socket | null, chatId: string, text: string): Promise<void> {
  if (!socket) throw new Error('Socket not connected');
  socket.emit('message', { chatId, text });
}

export function onNewMessage(socket: Socket | null, handler: (msg: Message) => void) {
  if (!socket) return () => {};
  const listener = (payload: NewMessagePayload) => {
    const { senderId, message } = payload || {} as any;
    if (!message) return;
    const msg: Message = {
      id: message.id ?? `srv-${Date.now()}`,
      chatId: message.chatId,
      text: message.text,
      userId: senderId ?? message.userId ?? 'unknown',
      sentAt: message.sentAt ? new Date(message.sentAt) : new Date(),
      receivedAt: new Date(),
      status: (message.status as MessageStatus) ?? MessageStatus.Delivered
    };
    handler(msg);
  };
  socket.on('newMessage', listener);
  return () => socket.off('newMessage', listener);
}

export function onSocketError(socket: Socket | null, handler: (err: any) => void) {
  if (!socket) return () => {};
  socket.on('error', handler);
  return () => socket.off('error', handler);
}
