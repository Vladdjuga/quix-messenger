'use client';

import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/stores/chat';
import { useAuthStore } from '@/stores/auth';
import { Message } from '@/types';

export default function ChatWindow() {
  const { selectedChatId, messages, sendMessage, isLoading, chats } = useChatStore();
  const { user } = useAuthStore();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedChat = chats.find(chat => chat.id === selectedChatId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !selectedChatId) return;

    await sendMessage(selectedChatId, messageText.trim());
    setMessageText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const messageDate = new Date(date);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach((message) => {
      const dateKey = new Date(message.sentAt).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    
    return groups;
  };

  if (!selectedChatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <svg className="mx-auto h-24 w-24 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
          </svg>
          <h3 className="mt-4 text-lg font-medium">Select a chat to start messaging</h3>
          <p className="mt-2">Choose from your existing conversations or start a new one</p>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-medium">
              {selectedChat?.title.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedChat?.title}
            </h2>
            <p className="text-sm text-gray-500">
              {selectedChat?.isOnline ? 'Online' : 'Last seen recently'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="text-center text-gray-500">Loading messages...</div>
        ) : Object.keys(messageGroups).length === 0 ? (
          <div className="text-center text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          Object.entries(messageGroups).map(([dateString, dayMessages]) => (
            <div key={dateString}>
              {/* Date Header */}
              <div className="flex justify-center mb-4">
                <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 border">
                  {formatDate(new Date(dateString))}
                </span>
              </div>

              {/* Messages for this date */}
              {dayMessages.map((message) => {
                const isOwn = message.userId === user?.id;
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwn 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-900 border'
                    }`}>
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        isOwn ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.sentAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <form onSubmit={handleSendMessage} className="flex space-x-4">
          <div className="flex-1">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${selectedChat?.title}...`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={1}
              style={{
                minHeight: '38px',
                maxHeight: '120px',
                height: 'auto',
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!messageText.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
