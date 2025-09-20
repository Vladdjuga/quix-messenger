"use client";
import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import {Message, MessageStatus, MessageWithLocalId} from "@/lib/types";
import {getLastMessagesByChatId} from "@/lib/api/messagesApi";
import {SocketContext} from "@/lib/contexts/SocketContext";
import {joinChat, leaveChat, onNewMessage, sendChatMessage} from "@/lib/realtime/chatSocketUseCases";
import {useCurrentUser} from "@/lib/hooks/data/user/userHook";

interface ChatWindowProps {
  chatId?: string;
  headerTitle?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, headerTitle }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const socket = useContext(SocketContext);
  const { user, loading: userLoading } = useCurrentUser();

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }
  const addMessage = useCallback((msg: MessageWithLocalId) => {
    setMessages(prev => {
      let exists = false;

      const newMessages = prev.map(m => {
        if ((msg.localId && m.id === msg.localId) || m.id === msg.id) {
          exists = true;
          return { ...m, ...msg };
        }
        return m;
      });

      if (!exists) {
        return [...prev, msg];
      }
      return newMessages;
    });
  }, [setMessages]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!chatId) return;
      setLoading(true);
      const data = await getLastMessagesByChatId(chatId);
      if (mounted) setMessages(data);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [chatId]);

  useEffect(() => {
    if (!socket || !chatId) return;
    joinChat(socket, chatId);
    const offNewMessage = onNewMessage(socket, (msg) => {
      if (msg.chatId !== chatId) return;
      addMessage(msg);
    });
    return () => {
      leaveChat(socket, chatId);
      offNewMessage?.();
    };
  }, [socket, chatId, addMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if(userLoading) {
    return <div className="flex-1 flex items-center justify-center">Loading...</div>;
  }
    if (!user) {
        return <div className="flex-1 flex items-center justify-center">Please log in to view the chat.</div>;
    }

  const handleSend = async () => {
    const value = text.trim();
    if (!value || !chatId) return;
    setText("");
    try {
      const msg : Message = {
        id: `local-${Date.now()}`,
        chatId:chatId,
        text: value,
        userId: user.id,
        createdAt: new Date(),
        status: MessageStatus.Sent,
      }
      await sendChatMessage(socket, chatId, value,msg.id);
      addMessage(msg);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="chat-header font-semibold flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="status-online" aria-hidden />
          <span>{headerTitle ?? 'Chat'}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-ghost">Search</button>
          <button className="btn-ghost">More</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-surface">
        {loading && <div className="text-muted">Loading...</div>}
        {!loading && messages.length === 0 && <div className="text-muted">No messages yet</div>}
        {!loading && messages.map(m => {
          const own = m.userId === user.id;
          return (
            <div key={m.id} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
              <div className={`message-bubble ${own ? 'message-own' : 'message-received'}`}>{m.text}</div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="message-input-container flex items-end gap-2">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={1}
          placeholder={`Message...`}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          className="flex-1 resize-none input-primary"
        />
        <button onClick={handleSend} disabled={!text.trim()} className="btn-primary disabled:opacity-50">Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;
