import { Socket } from 'socket.io-client';
import {MessageStatus, MessageWithLocalId} from '@/lib/types';

export type NewMessagePayload = {
  senderId: string;
  message: {
    id: string;
    chatId: string;
    text: string;
    createdAt?: string | Date;
    userId?: string;
    status?: number;
    localId?: string;
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

export async function sendChatMessage(socket: Socket | null, chatId: string, text: string,localId:string): Promise<void> {
  if (!socket) throw new Error('Socket not connected');
  socket.emit('message', { chatId, text, localId});
}

export function onNewMessage(socket: Socket | null, handler: (msg: MessageWithLocalId) => void) {
  if (!socket) return () => {};

  const listener = (payload: unknown) => {
    try {
      const obj = payload as Partial<NewMessagePayload> | undefined;
      if (!obj?.message) return;

      const msgPayload = obj.message;

      const msg: MessageWithLocalId = {
        id: msgPayload.id,
        chatId: msgPayload.chatId,
        text: msgPayload.text,
        userId: msgPayload.userId ?? 'unknown',
        createdAt: msgPayload.createdAt ? new Date(msgPayload.createdAt) : new Date(),
        status: (msgPayload.status as MessageStatus) ?? MessageStatus.Delivered,
        localId: msgPayload.localId,
      };

      handler(msg);

    } catch (e) {
      console.error('Failed to parse newMessage payload', e);
    }
  };

  socket.on('newMessage', listener);
  return () => socket.off('newMessage', listener);
}
export function onSocketError(socket: Socket | null, handler: (err: unknown) => void) {
  if (!socket) return () => {};
  socket.on('error', handler);
  return () => socket.off('error', handler);
}
