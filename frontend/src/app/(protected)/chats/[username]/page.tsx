import React from "react";
import ChatWindow from "@/components/messaging/ChatWindow";

export default async function ChatUserPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams?: Promise<{ chatId?: string }>;
}) {
  const { username } = await params;
  const sp = searchParams ? await searchParams : undefined;
  const chatId = sp?.chatId ? decodeURIComponent(sp.chatId) : undefined;
  return <ChatWindow username={decodeURIComponent(username)} chatId={chatId} />;
}
