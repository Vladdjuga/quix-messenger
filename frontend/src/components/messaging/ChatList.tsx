"use client";
import React from "react";
import Link from "next/link";
import { ChatWithLastMessage } from "@/lib/types";

interface Props {
  chats: ChatWithLastMessage[];
  activeUsername?: string;
}

export const ChatList: React.FC<Props> = ({ chats, activeUsername }) => {
  return (
    <div className="space-y-1">
      {chats.map(chat => {
        const username = chat.title; // assuming direct chat title is username for now
        const active = activeUsername === username;
        return (
          <Link
            key={chat.id}
            href={`/chats/${encodeURIComponent(username)}`}
            className={`block px-3 py-2 rounded text-sm border border-transparent hover:bg-gray-50 truncate ${active ? 'bg-gray-200 font-medium' : ''}`}
          >
            <div className="truncate">{chat.title}</div>
            {chat.lastMessage && (
              <div className="text-xs text-gray-500 truncate">{chat.lastMessage.text}</div>
            )}
          </Link>
        );
      })}
      {chats.length === 0 && (
        <div className="text-xs text-gray-500 px-2 py-4 text-center">No chats</div>
      )}
    </div>
  );
};

export default ChatList;
