import { Socket } from 'socket.io-client';
import { Message, MessageStatus } from '@/lib/types';

export type NewMessagePayload = {
  senderId: string;
  message: {
    id?: string;
    chatId: string;
    text: string;
    createdAt?: string | Date;
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
  const listener = (payload: unknown) => {
    const obj = (payload ?? {}) as Partial<NewMessagePayload>;
    const senderId = typeof obj.senderId === 'string' ? obj.senderId : undefined;
    const message = obj.message as Partial<NewMessagePayload["message"]> | undefined;
  if (!message || typeof message.chatId !== 'string' || typeof message.text !== 'string') return;
    const msg: Message = {
      id: message.id ?? `srv-${Date.now()}`,
      chatId: message.chatId,
      text: message.text,
      userId: senderId ?? message.userId ?? 'unknown',
      createdAt: message.createdAt ? new Date(message.createdAt) : new Date(),
      status: (message.status as MessageStatus) ?? MessageStatus.Delivered
    };
    handler(msg);
  };
  socket.on('newMessage', listener);
  return () => socket.off('newMessage', listener);
}

export function onSocketError(socket: Socket | null, handler: (err: unknown) => void) {
  if (!socket) return () => {};
  socket.on('error', handler);
  return () => socket.off('error', handler);
}
