import React from "react";
import ChatWindow from "@/components/messaging/ChatWindow";

export default async function ChatPage({ params }: { params: Promise<{
    chatId: string,
}> }) {
  const { chatId,} = await params;
  return <ChatWindow chatId={chatId} headerTitle={""} />;
  // Header title is empty for testing but in the future this parameter
  // will be removed completely and chat data will be loaded separately
}
