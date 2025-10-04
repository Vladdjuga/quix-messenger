"use client";
import React, {useEffect, useMemo, useState} from "react";
import Link from "next/link";
import { ChatType, ChatWithLastMessage } from "@/lib/types";
import { useUserPresencePolling } from "@/lib/hooks/data/user/useUserPresencePolling";
import { formatLastSeen } from "@/lib/utils/formatLastSeen";
import Image from "next/image";
import {getProtectedUserAvatarUrl} from "@/lib/utils/protectedAvatar";

interface Props {
  chat: ChatWithLastMessage;
  active?: boolean;
  currentUserId?: string;
}

export const ChatListItem: React.FC<Props> = ({ chat, active, currentUserId }) => {
  // For direct chats, determine the other user and track presence
  const otherUser = useMemo(() => {
    if (chat.chatType !== ChatType.Direct) return null;
    const others = (chat.participants ?? []).filter(u => u.id !== currentUserId);
    return others.length > 0 ? others[0] : null;
  }, [chat.chatType, chat.participants, currentUserId]);

  const otherUserId = otherUser?.id ?? null;
  const { isOnline, lastSeenAt } = useUserPresencePolling(otherUserId, { intervalMs: 10000, enabled: !!otherUserId });

  const displayTitle = useMemo(() => {
    if (chat.chatType === ChatType.Direct && otherUser) {
      return otherUser.username || chat.title;
    }
    return chat.title;
  }, [chat.title, chat.chatType, otherUser]);

  const subtitle = useMemo(() => {
    if (!chat.lastMessage) return "No messages yet";
    return chat.lastMessage.text || "\u00A0";
  }, [chat.lastMessage]);

  const timeLabel = useMemo(() => {
    if (!chat.lastMessage?.createdAt) return "";
    const d = chat.lastMessage.createdAt;
    const now = new Date();
    const sameDay = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    return sameDay
      ? d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
      : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }, [chat.lastMessage]);

  const unread = chat.unreadCount > 0 ? chat.unreadCount : 0;

  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!otherUserId) { setAvatarSrc(null); return; }
      const url = await getProtectedUserAvatarUrl(otherUserId);
      if (url) {
        setAvatarSrc(url);
      } else {
        setAvatarSrc(null);
      }
    })();
  }, [otherUserId]);

  const initials = useMemo(() => {
    const name = (chat.chatType === ChatType.Direct ? otherUser?.username : chat.title) || "?";
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "?";
    const second = parts.length > 1 ? parts[1][0] : "";
    return (first + second).toUpperCase();
  }, [chat.title, chat.chatType, otherUser]);

  return (
    <Link
      key={chat.id}
      href={{ pathname: `/chats/${chat.id}` }}
      className={`block px-3 py-2 rounded border ${active ? 'border-default bg-muted/10' : 'border-transparent hover:bg-muted/10'}`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative w-10 h-10 shrink-0">
          {avatarSrc ? (
              <Image
                  src={avatarSrc}
                  alt={`${initials}`}
                  width={128}
                  height={128}
                  className="w-10 h-10 rounded-full object-cover"
                  unoptimized
              />
          ) : (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs text-primary">
              {initials}
            </div>
          )}
          {chat.chatType === ChatType.Direct && isOnline && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 ring-2 ring-surface" aria-hidden />
          )}
        </div>

        {/* Text block */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className={`truncate text-sm ${active ? 'font-semibold' : 'font-medium'}`}>{displayTitle}</div>
            {unread > 0 && (
              <span className="ml-1 inline-flex items-center justify-center text-[10px] px-1.5 py-0.5 rounded-full bg-primary text-white">
                {unread}
              </span>
            )}
            <div className="ml-auto text-[10px] text-muted shrink-0">{timeLabel}</div>
          </div>
          <div className="text-xs text-muted truncate">
            {chat.chatType === ChatType.Direct && !isOnline && lastSeenAt
              ? `Last seen ${formatLastSeen(lastSeenAt)}`
              : subtitle}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ChatListItem;
