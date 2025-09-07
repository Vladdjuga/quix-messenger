import React from 'react';
import { Message, MessageStatus } from '@/lib/types';

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  senderName?: string;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isOwn, senderName }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const isRead = (message.status & MessageStatus.Read) === MessageStatus.Read;

  return (
    <div className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
        {/* Message bubble */}
        <div className={`message-bubble ${isOwn ? 'message-own' : 'message-received'}`}>
          {!isOwn && senderName && (
            <p className="text-xs font-medium mb-1 text-gray-600">
              {senderName}
            </p>
          )}
          <p className="break-words">
            {message.text}
          </p>
        </div>
        
        {/* Timestamp and read status */}
        <div className={`flex-center text-muted mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span>{formatTime(message.sentAt)}</span>
          {isOwn && (
            <div className="ml-1">
              {isRead ? (
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                </svg>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
