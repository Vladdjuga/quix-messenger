import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useChatStore } from '@/stores/chat';
import { useAuthStore } from '@/stores/auth';
import { Message } from '@/types';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8081';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { isAuthenticated } = useAuthStore();
  const { addMessage, selectedChatId } = useChatStore();

  useEffect(() => {
    if (!isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) return;

    // Create socket connection
    socketRef.current = io(SOCKET_URL, {
      auth: {
        token,
      },
    });

    const socket = socketRef.current;

    // Socket event handlers
    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    socket.on('newMessage', (message: Message) => {
      addMessage(message);
    });

    socket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [isAuthenticated, addMessage]);

  // Join chat room when selected chat changes
  useEffect(() => {
    if (socketRef.current && selectedChatId) {
      socketRef.current.emit('joinChat', selectedChatId);
      
      return () => {
        if (socketRef.current && selectedChatId) {
          socketRef.current.emit('leaveChat', selectedChatId);
        }
      };
    }
  }, [selectedChatId]);

  return socketRef.current;
}
