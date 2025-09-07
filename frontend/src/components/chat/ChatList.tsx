import React, { useState } from 'react';
import { ChatWithLastMessage } from '@/lib/types';
import ChatListItem from './ChatListItem';

interface ChatListProps {
  chats: ChatWithLastMessage[];
  selectedChatId?: string;
  onChatSelect: (chatId: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ chats, selectedChatId, onChatSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="chat-sidebar">
      {/* Header */}
      <div className="chat-header">
        <h2 className="text-base font-medium text-gray-700 mb-3">Chats</h2>
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-primary pl-10"
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Chat List */}
      <div className="chat-list">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              isSelected={chat.id === selectedChatId}
              onClick={() => onChatSelect(chat.id)}
            />
          ))
        ) : (
          <div className="p-4 text-center text-muted">
            {searchTerm ? 'No chats found' : 'No chats yet'}
          </div>
        )}
      </div>

      {/* New Chat Button */}
      <div className="message-input-container">
        <button className="btn-primary w-full">
          + New Chat
        </button>
      </div>
    </div>
  );
};

export default ChatList;
