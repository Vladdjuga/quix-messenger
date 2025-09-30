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

export async function deleteChatMessage(socket: Socket | null, chatId: string, messageId: string): Promise<void> {
  if (!socket) throw new Error('Socket not connected');
  socket.emit('deleteMessage', { chatId, messageId });
}

export async function editChatMessage(socket: Socket | null, chatId: string, messageId: string, text: string): Promise<void> {
  if (!socket) throw new Error('Socket not connected');
  socket.emit('editMessage', { chatId, messageId, text });
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

export function onMessageDeleted(socket: Socket | null, handler: (payload: { messageId: string; chatId: string; senderId?: string }) => void) {
  if (!socket) return () => {};
  const listener = (payload: unknown) => {
    try {
      const obj = payload as { messageId?: string; chatId?: string; senderId?: string } | undefined;
      if (!obj?.messageId || !obj?.chatId) return;
      handler({ messageId: obj.messageId, chatId: obj.chatId, senderId: obj.senderId });
    } catch (e) {
      console.error('Failed to parse messageDeleted payload', e);
    }
  };
  socket.on('messageDeleted', listener);
  return () => socket.off('messageDeleted', listener);
}

export function onMessageEdited(socket: Socket | null, handler: (msg: MessageWithLocalId) => void) {
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
        status: (msgPayload.status as MessageStatus) ?? MessageStatus.Modified,
      };
      handler(msg);
    } catch (e) {
      console.error('Failed to parse messageEdited payload', e);
    }
  };
  socket.on('messageEdited', listener);
  return () => socket.off('messageEdited', listener);
}
export function onSocketError(socket: Socket | null, handler: (err: unknown) => void) {
  if (!socket) return () => {};
  socket.on('error', handler);
  return () => socket.off('error', handler);
}

export async function sendTyping(socket: Socket | null, chatId: string): Promise<void> {
  if (!socket) return;
  socket.emit('typing', { chatId });
}

export async function sendStopTyping(socket: Socket | null, chatId: string): Promise<void> {
  if (!socket) return;
  socket.emit('stopTyping', { chatId });
}

export function onTyping(socket: Socket | null, handler: (payload: { chatId: string; userId: string }) => void) {
  if (!socket) return () => {};
  const listener = (payload: unknown) => {
    try {
      const obj = payload as { chatId?: string; userId?: string } | undefined;
      if (!obj?.chatId || !obj?.userId) return;
      handler({ chatId: obj.chatId, userId: obj.userId });
    } catch (e) {
      console.error('Failed to parse typing payload', e);
    }
  };
  socket.on('typing', listener);
  return () => socket.off('typing', listener);
}

export function onStopTyping(socket: Socket | null, handler: (payload: { chatId: string; userId: string }) => void) {
  if (!socket) return () => {};
  const listener = (payload: unknown) => {
    try {
      const obj = payload as { chatId?: string; userId?: string } | undefined;
      if (!obj?.chatId || !obj?.userId) return;
      handler({ chatId: obj.chatId, userId: obj.userId });
    } catch (e) {
      console.error('Failed to parse stopTyping payload', e);
    }
  };
  socket.on('stopTyping', listener);
  return () => socket.off('stopTyping', listener);
}
