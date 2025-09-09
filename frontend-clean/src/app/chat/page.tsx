'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useChatStore } from '@/stores/chat';
import { useRouter } from 'next/navigation';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';

export default function ChatPage() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { loadChats } = useChatStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      loadChats();
    }
  }, [isAuthenticated, isLoading, router, loadChats]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="h-screen flex bg-gray-100">
      <ChatSidebar />
      <ChatWindow />
    </div>
  );
}
