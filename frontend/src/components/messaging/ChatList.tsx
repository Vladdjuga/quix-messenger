"use client";
import React from "react";
import { ChatWithLastMessage } from "@/lib/types";
import ChatListItem from "@/components/messaging/ChatListItem";
import { useCurrentUser } from "@/lib/hooks/data/user/userHook";

interface Props {
  chats: ChatWithLastMessage[];
  activeChatId?: string;
}

export const ChatList: React.FC<Props> = ({ chats, activeChatId }) => {
  const { user } = useCurrentUser();
  return (
    <div className="space-y-1">
      {chats.map(chat => {
        const active = activeChatId === chat.id;
        return (
          <ChatListItem key={chat.id} chat={chat} active={active} currentUserId={user?.id} />
        );
      })}
      {chats.length === 0 && (
        <div className="text-xs text-muted px-2 py-4 text-center">No chats</div>
      )}
    </div>
  );
};

export default ChatList;
