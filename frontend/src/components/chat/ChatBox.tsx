import React from 'react';
import { ChatWithLastMessage, Message } from '@/lib/types';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface ChatBoxProps {
  selectedChat: ChatWithLastMessage | null;
  messages: Message[];
  currentUserId: string;
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

const ChatBox: React.FC<ChatBoxProps> = ({ 
  selectedChat, 
  messages, 
  currentUserId, 
  onSendMessage,
  isLoading = false 
}) => {
  if (!selectedChat) {
    return (
      <div className="flex-center flex-1 bg-surface">
        <div className="text-center text-muted p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-surface-elevated rounded-full flex items-center justify-center border border-default">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Select a chat to start messaging</h3>
          <p className="text-base">Choose from your existing conversations or start a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-surface">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-default chat-header">
        <div className="flex-center">
          {/* Avatar */}
          <div className="w-10 h-10 mr-3">
            <div className="w-10 h-10 bg-surface-elevated rounded-full flex items-center justify-center border border-default">
              <span className="text-secondary font-medium">
                {selectedChat.title.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Chat Info */}
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-medium text-primary truncate">{selectedChat.title}</h2>
              {selectedChat.isOnline && (
                <div className="status-online"></div>
              )}
            </div>
            <p className="text-muted">
              {selectedChat.isOnline ? 'Online' : 'Last seen recently'}
            </p>
          </div>
        </div>

        {/* Chat Actions */}
        <div className="flex-center space-x-2">
          {/* Search */}
          <button className="btn-icon">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* More Options */}
          <button className="btn-icon">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <MessageList 
        messages={messages} 
        currentUserId={currentUserId}
        isLoading={isLoading}
      />

      {/* Message Input */}
      <MessageInput 
        onSendMessage={onSendMessage}
        disabled={isLoading}
        placeholder={`Message ${selectedChat.title}...`}
      />
    </div>
  );
};

export default ChatBox;
