"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { ChatWithLastMessage } from "@/lib/types";
import { api } from "@/app/api";
import { ChatList } from "@/components/messaging/ChatList";
import { usePathname } from "next/navigation";
import ChatMenuPopOut from "@/components/menus/ChatMenuPopOut";

export default function ChatsLayout({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<ChatWithLastMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const activeChatId = useMemo(() => {
    if (!pathname) return undefined;
    // Expected paths: /chats or /chats/[chatId]
    const parts = pathname.split('/').filter(Boolean);
    const chatsIndex = parts.indexOf('chats');
    if (chatsIndex >= 0 && parts.length > chatsIndex + 1) {
      return decodeURIComponent(parts[chatsIndex + 1]);
    }
    return undefined;
  }, [pathname]);

  const loadChats = useCallback(async () => {
    setLoading(true);
    try {
      const list = await api.chats.list();
      setChats(list as ChatWithLastMessage[]);
    } catch (error) {
      console.error("Failed to load chats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChats();
  }, [loadChats]);



  return (
      <div className="h-[calc(100vh-80px)] flex bg-surface">
        <aside className="w-80 border-r border-default bg-surface flex flex-col">
          <div className="chat-header font-semibold">Chats</div>
          <div className="p-3">
            <input
              placeholder="Search"
              className="input-primary"
              disabled={true}
            />
            {/* Search is not implemented yet */}

            <ChatMenuPopOut onChatCreated={loadChats} />
          </div>
          <div className="flex-1 overflow-y-auto chat-list">
            {loading && <div className="p-4 text-muted">Loading...</div>}
            {!loading && chats.length === 0 && (
              <div className="p-4 text-muted">No chats</div>
            )}
            {!loading && <ChatList chats={chats} activeChatId={activeChatId ?? undefined} />}
          </div>
        </aside>
        <section className="flex-1 flex flex-col chat-main">
          {children}
        </section>
      </div>
  );
}
