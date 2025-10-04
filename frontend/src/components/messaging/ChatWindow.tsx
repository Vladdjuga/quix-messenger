"use client";
import React, {useContext, useState, useEffect} from "react";
import {SocketContext} from "@/lib/contexts/SocketContext";
import {useCurrentUser} from "@/lib/hooks/data/user/userHook";
import MessageInput from "@/components/messaging/MessageInput";
import MessageList from "@/components/messaging/MessageList";
import ChatHeader from "@/components/messaging/ChatHeader";
import AddUserToChatModal from "@/components/messaging/AddUserToChatModal";
import ChatSettingsModal from "@/components/messaging/ChatSettingsModal";
import useTyping from "@/lib/hooks/data/messages/useTyping";
import {useMessages} from "@/lib/hooks/data/messages/useMessages";
import {ChatWithLastMessage} from "@/lib/types";
import { api } from "@/app/api";

interface ChatWindowProps {
  chatId: string;
  headerTitle?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, headerTitle }) => {
  const { user, loading: userLoading } = useCurrentUser();
  const socket = useContext(SocketContext);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [chatInfo, setChatInfo] = useState<ChatWithLastMessage | null>(null);
  const [loadingChat, setLoadingChat] = useState(true);

  const { typingUsers,handleInputChange } = useTyping(chatId,socket,user);
  const { sendMessage,messages, loading, deleteMessage, editMessage, loadMore } = useMessages({chatId});

  // Load chat info to get chatType and chatRole
  useEffect(() => {
    const loadChatInfo = async () => {
      try {
        const chats = await api.chats.list();
        const chat = chats.find(c => c.id === chatId);
        setChatInfo(chat || null);
      } catch (error) {
        console.error("Failed to load chat info:", error);
      } finally {
        setLoadingChat(false);
      }
    };
    loadChatInfo();
  }, [chatId]);

  const refreshChatInfo = async () => {
    try {
      const chats = await api.chats.list();
      const chat = chats.find(c => c.id === chatId);
      setChatInfo(chat || null);
    } catch (error) {
      console.error("Failed to refresh chat info:", error);
    }
  };

  if(userLoading || loading || loadingChat) {
    return <div className="flex-1 flex items-center justify-center">Loading...</div>;
  }
    if (!user) {
        return <div className="flex-1 flex items-center justify-center">Please log in to view the chat.</div>;
    }

  return (
    <div className="flex flex-col h-full bg-surface">
        <ChatHeader 
            title={headerTitle || chatInfo?.title} 
            typingUsers={typingUsers}
            chatType={chatInfo?.chatType}
            chatRole={chatInfo?.chatRole}
            onAddUserClick={() => setShowAddUserModal(true)}
            onSettingsClick={() => setShowSettingsModal(true)}
        />
        <MessageList
            chatId={chatId!}
            currentUserId={user.id}
            loadMore={loadMore}
            messages={messages}
            deleteMessage={deleteMessage}
            editMessage={editMessage}
        />
        <MessageInput
            onChange={handleInputChange}
            onSend={sendMessage}
            placeholder="Type a message..."/>
        
        {showAddUserModal && chatInfo && (
            <AddUserToChatModal
                chatId={chatId}
                chatType={chatInfo.chatType}
                onClose={() => setShowAddUserModal(false)}
                onUserAdded={async () => {
                    await refreshChatInfo();
                    console.log("User added to chat");
                }}
            />
        )}

        {showSettingsModal && chatInfo && (
            <ChatSettingsModal
                chatId={chatId}
                chatType={chatInfo.chatType}
                currentTitle={chatInfo.title}
                currentUserRole={chatInfo.chatRole}
                onClose={() => setShowSettingsModal(false)}
                onUpdated={async () => {
                    await refreshChatInfo();
                }}
            />
        )}
    </div>
  );
};

export default ChatWindow;
