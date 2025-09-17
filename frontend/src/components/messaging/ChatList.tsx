"use client";
import React from "react";
import Link from "next/link";
import { ChatWithLastMessage } from "@/lib/types";

interface Props {
  chats: ChatWithLastMessage[];
  activeChatId?: string;
}

export const ChatList: React.FC<Props> = ({ chats, activeChatId }) => {
  return (
    <div className="space-y-1">
      {chats.map(chat => {
        const active = activeChatId === chat.id;
        return (
          <Link
            key={chat.id}
            href={{
              pathname: `/chats/${chat.id}`,
            }}
            className={`block px-3 py-2 rounded text-sm border ${active ? 'border-default bg-muted/10 font-medium' : 'border-transparent hover:bg-muted/10'} truncate`}
          >
            <div className="truncate flex items-center gap-2">
              {chat.isOnline && <span className="inline-block w-2 h-2 rounded-full bg-green-500" aria-hidden />}
              <span className="truncate">{chat.title}</span>
              {chat.unreadCount > 0 && (
                <span className="ml-auto inline-flex items-center justify-center text-[10px] px-1.5 py-0.5 rounded-full bg-primary text-white">
                  {chat.unreadCount}
                </span>
              )}
            </div>
            {chat.lastMessage && (
              <div className="text-xs text-muted truncate">{chat.lastMessage.text}</div>
            )}
          </Link>
        );
      })}
      {chats.length === 0 && (
        <div className="text-xs text-muted px-2 py-4 text-center">No chats</div>
      )}
    </div>
  );
};

export default ChatList;
