import React from 'react';
import { ChatWithLastMessage } from '@/lib/types';

interface ChatListItemProps {
  chat: ChatWithLastMessage;
  isSelected: boolean;
  onClick: () => void;
}

const ChatListItem: React.FC<ChatListItemProps> = ({ chat, isSelected, onClick }) => {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div
      className={`chat-item ${isSelected ? 'chat-item-active' : ''}`}
      onClick={onClick}
    >
      {/* Avatar */}
      <div className="w-12 h-12 mr-3">
        <div className="w-12 h-12 bg-surface-elevated rounded-full flex items-center justify-center border border-default">
          <span className="text-secondary font-medium text-lg">
            {chat.title.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Chat Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-primary truncate">
              {chat.title}
            </h3>
            {chat.isOnline && (
              <div className="status-online"></div>
            )}
          </div>
          {chat.lastMessage && (
            <span className="text-xs text-muted">
              {formatTime(chat.lastMessage.sentAt)}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted truncate">
            {chat.lastMessage ? chat.lastMessage.text : 'No messages yet'}
          </p>
          {chat.unreadCount > 0 && (
            <span className="w-2 h-2 bg-primary-500 rounded-full">
              {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatListItem;
