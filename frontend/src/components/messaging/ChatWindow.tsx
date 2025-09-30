"use client";
import React, {useContext} from "react";
import {SocketContext} from "@/lib/contexts/SocketContext";
import {useCurrentUser} from "@/lib/hooks/data/user/userHook";
import MessageInput from "@/components/messaging/MessageInput";
import MessageList from "@/components/messaging/MessageList";
import ChatHeader from "@/components/messaging/ChatHeader";
import useTyping from "@/lib/hooks/data/messages/useTyping";
import {useMessages} from "@/lib/hooks/data/messages/useMessages";

interface ChatWindowProps {
  chatId: string;
  headerTitle?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId,headerTitle }) => {
  const { user, loading: userLoading } = useCurrentUser();
  const socket = useContext(SocketContext);

  const { typingUsers,handleInputChange } = useTyping(chatId,socket,user);
  const { sendMessage } = useMessages({chatId});

  if(userLoading) {
    return <div className="flex-1 flex items-center justify-center">Loading...</div>;
  }
    if (!user) {
        return <div className="flex-1 flex items-center justify-center">Please log in to view the chat.</div>;
    }

  return (
    <div className="flex flex-col h-full bg-surface">
        <ChatHeader title={headerTitle} typingUsers={Array.from(typingUsers)}/>
        <MessageList chatId={chatId!} currentUserId={user.id}/>
        <MessageInput
            onChange={handleInputChange}
            onSend={sendMessage}
            placeholder="Type a message..."/>
    </div>
  );
};

export default ChatWindow;
