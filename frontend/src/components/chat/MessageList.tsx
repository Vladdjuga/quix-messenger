import React, { useEffect, useRef } from 'react';
import { Message } from '@/lib/types';
import MessageItem from './MessageItem';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isLoading?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId, isLoading = false }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach((message) => {
      const dateKey = message.sentAt.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    
    return groups;
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const messageGroups = groupMessagesByDate(messages);

  if (isLoading) {
    return (
      <div className="flex-center flex-1">
        <div className="flex-center space-x-2">
          <div className="status-typing"></div>
          <div className="status-typing" style={{animationDelay: '0.1s'}}></div>
          <div className="status-typing" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-center flex-1">
        <div className="text-center text-muted p-8">
          <div className="w-12 h-12 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-lg">No messages yet</p>
          <p className="text-sm">Start a conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {Object.entries(messageGroups).map(([dateString, dayMessages]) => (
        <div key={dateString}>
          {/* Date Header */}
          <div className="flex-center mb-4">
            <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded">
              {formatDateHeader(dateString)}
            </span>
          </div>
          
          {/* Messages for this date */}
          {dayMessages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              isOwn={message.userId === currentUserId}
              senderName="User" // TODO: Get actual sender name from user service
            />
          ))}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
