"use client";
import React, { useEffect, useState } from "react";
import { SocketProvider } from "@/lib/contexts/SocketContext";
import Link from "next/link";
import { ChatWithLastMessage } from "@/lib/types";
import { getChats } from "@/lib/api/chatsApi";

export default function ChatsLayout({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<ChatWithLastMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
  const list = await getChats();
      if (mounted) setChats(list);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <SocketProvider>
      <div className="h-[calc(100vh-80px)] flex bg-gray-100">
        <aside className="w-72 border-r border-gray-200 bg-white flex flex-col">
          <div className="p-4 border-b font-semibold">Chats</div>
          <div className="p-2">
            <input
              placeholder="Search"
              className="w-full border rounded px-2 py-1 text-sm"
              // For now not implemented
              disabled={loading}
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading && <div className="p-4 text-sm text-gray-500">Loading...</div>}
            {!loading && chats.length === 0 && (
              <div className="p-4 text-sm text-gray-500">No chats</div>
            )}
            {!loading && chats.map(c => (
              <Link key={c.id} href={`/chats/${encodeURIComponent(c.title)}?chatId=${encodeURIComponent(c.id)}`} className="block px-4 py-2 hover:bg-gray-50 text-sm">
                <div className="font-medium truncate">{c.title}</div>
                {/* Hidden field carrying chat id */}
                <input type="hidden" name="chatId" value={c.id} readOnly aria-hidden />
                {c.lastMessage && (
                  <div className="text-xs text-gray-500 truncate">{c.lastMessage.text}</div>
                )}
              </Link>
            ))}
          </div>
        </aside>
        <section className="flex-1 flex flex-col">
          {children}
        </section>
      </div>
    </SocketProvider>
  );
}
