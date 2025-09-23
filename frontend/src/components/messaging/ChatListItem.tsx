"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import { ChatType, ChatWithLastMessage } from "@/lib/types";
import { useOnlinePolling } from "@/lib/hooks/data/user/useOnlinePolling";

interface Props {
  chat: ChatWithLastMessage;
  active?: boolean;
  currentUserId?: string;
}

export const ChatListItem: React.FC<Props> = ({ chat, active, currentUserId }) => {
  // For direct chats, determine the other user and track presence
  const otherUserId = useMemo(() => {
    if (chat.chatType !== ChatType.Direct) return null;
    const others = (chat.participants ?? []).filter(u => u.id !== currentUserId);
    return others.length > 0 ? others[0].id : null;
  }, [chat.chatType, chat.participants, currentUserId]);

  const { isOnline } = useOnlinePolling(otherUserId, { intervalMs: 10000, enabled: !!otherUserId });
  const displayTitle = useMemo(() => {
    if (chat.chatType === ChatType.Direct) {
      const others = (chat.participants ?? []).filter(u => u.id !== currentUserId);
      if (others.length > 0) return others[0].username || chat.title;
    }
    return chat.title;
  }, [chat, currentUserId]);

  const unread = chat.unreadCount > 0 ? chat.unreadCount : 0;
  return (
    <Link
      key={chat.id}
      href={{ pathname: `/chats/${chat.id}` }}
      className={`block px-3 py-2 rounded text-sm border ${active ? 'border-default bg-muted/10 font-medium' : 'border-transparent hover:bg-muted/10'} truncate`}
    >
      <div className="truncate flex items-center gap-2">
        {chat.chatType === ChatType.Direct && isOnline && (
          <span className="inline-block w-2 h-2 rounded-full bg-green-500" aria-hidden />
        )}
  <span className="truncate">{displayTitle}</span>
        {unread > 0 && (
          <span className="ml-auto inline-flex items-center justify-center text-[10px] px-1.5 py-0.5 rounded-full bg-primary text-white">
            {unread}
          </span>
        )}
      </div>
      {chat.lastMessage && (
        <div className="text-xs text-muted truncate">{chat.lastMessage.text}</div>
      )}
    </Link>
  );
};

export default ChatListItem;
