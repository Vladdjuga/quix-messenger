'use client';

import { useChatStore } from '@/stores/chat';
import { useAuthStore } from '@/stores/auth';
import { logout } from '@/services/auth';
import { useRouter } from 'next/navigation';

export default function ChatSidebar() {
  const { chats, selectedChatId, selectChat, isLoading } = useChatStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Quix Messenger</h1>
            {user && (
              <p className="text-sm text-blue-100">
                Welcome, {user.firstName}!
              </p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="text-blue-100 hover:text-white transition-colors"
            title="Logout"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search chats..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">
            Loading chats...
          </div>
        ) : chats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No chats yet. Start a conversation!
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => selectChat(chat.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedChatId === chat.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium">
                    {chat.title.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {chat.title}
                    </h3>
                    {chat.lastMessage && (
                      <span className="text-xs text-gray-500">
                        {formatTime(chat.lastMessage.sentAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-1">
                    {chat.lastMessage?.text || 'No messages yet'}
                  </p>
                </div>

                {/* Unread Count */}
                {chat.unreadCount > 0 && (
                  <div className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
