"use client";
import React, { useEffect, useMemo, useState } from "react";
import { ChatWithLastMessage } from "@/lib/types";
import { api } from "@/app/api";
import { mapReadChatWithLastMessageDtos } from "@/lib/mappers/chatMapper";
import { ChatList } from "@/components/messaging/ChatList";
import { usePathname } from "next/navigation";

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

  useEffect(() => {
    let mounted = true;
    (async () => {
    setLoading(true);
    const resp = await api.chats.list();
    const list: ChatWithLastMessage[] = mapReadChatWithLastMessageDtos(resp.data);
    if (mounted) setChats(list);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);


  return (
      <div className="h-[calc(100vh-80px)] flex bg-surface">
        <aside className="w-80 border-r border-default bg-surface flex flex-col">
          <div className="chat-header font-semibold">Chats</div>
          <div className="p-3">
            <input
              placeholder="Search"
              className="input-primary"
              disabled={loading}
            />
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
