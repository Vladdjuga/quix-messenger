import React from "react";
import ChatWindow from "@/components/messaging/ChatWindow";

interface Params { username: string }
interface SearchParams { chatId?: string }

export default function ChatUserPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { username } = params;
  const chatId = searchParams?.chatId ? decodeURIComponent(searchParams.chatId) : undefined;
  return <ChatWindow username={decodeURIComponent(username)} chatId={chatId} />;
}
