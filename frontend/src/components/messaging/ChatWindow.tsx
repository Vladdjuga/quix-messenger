"use client";
import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import {Message, MessageStatus, MessageWithLocalId} from "@/lib/types";
import { api } from "@/app/api";
import { mapReadMessageDtos } from "@/lib/mappers/messageMapper";
import {SocketContext} from "@/lib/contexts/SocketContext";
import {joinChat, leaveChat, onNewMessage, sendChatMessage, deleteChatMessage, onMessageDeleted, editChatMessage, onMessageEdited, sendTyping, sendStopTyping, onTyping, onStopTyping} from "@/lib/realtime/chatSocketUseCases";
import {useCurrentUser} from "@/lib/hooks/data/user/userHook";

interface ChatWindowProps {
  chatId?: string;
  headerTitle?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const socket = useContext(SocketContext);
  const { user, loading: userLoading } = useCurrentUser();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>("");
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const typingCooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopTypingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      const count = 20;
      const resp = await api.messages.last(chatId, count);
      const data = mapReadMessageDtos(resp.data);
      if (mounted) setMessages(data.reverse()); // reverse to have oldest first
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [chatId]);

  useEffect(() => {
    if (!socket || !chatId || !user) return;
    joinChat(socket, chatId);
    const offNewMessage = onNewMessage(socket, (msg) => {
      if (msg.chatId !== chatId) return;
      addMessage(msg);
    });
    const offEdited = onMessageEdited(socket, (msg) => {
      if (msg.chatId !== chatId) return;
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, text: msg.text, status: (m.status | MessageStatus.Modified) } : m));
    });
    const offDeleted = onMessageDeleted(socket, ({ messageId, chatId: cid }) => {
      if (cid !== chatId) return;
      setMessages(prev => prev.filter(m => m.id !== messageId));
    });
    const offTyping = onTyping(socket, ({ chatId: cid, userId }) => {
      if (cid !== chatId || userId === user?.id) return;
      setTypingUsers(prev => {
        const next = new Set(prev);
        next.add(userId);
        return next;
      });
      // Auto-clear after 2s if no further typing from this user
      const existing = typingTimeoutsRef.current.get(userId);
      if (existing) clearTimeout(existing);
      const t = setTimeout(() => {
        setTypingUsers(prev => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
        typingTimeoutsRef.current.delete(userId);
      }, 2000);
      typingTimeoutsRef.current.set(userId, t);
    });
    const offStopTyping = onStopTyping(socket, ({ chatId: cid, userId }) => {
      if (cid !== chatId || userId === user?.id) return;
      const existing = typingTimeoutsRef.current.get(userId);
      if (existing) clearTimeout(existing);
      typingTimeoutsRef.current.delete(userId);
      setTypingUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });
    return () => {
      leaveChat(socket, chatId);
      offNewMessage?.();
      offEdited?.();
      offDeleted?.();
      offTyping?.();
      offStopTyping?.();
      // Clear any timers
      typingTimeoutsRef.current.forEach(clearTimeout);
      typingTimeoutsRef.current.clear();
      if (typingCooldownRef.current) clearTimeout(typingCooldownRef.current);
      if (stopTypingRef.current) clearTimeout(stopTypingRef.current);
    };
  }, [socket, chatId, addMessage, user]);

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
      // stop typing after sending
      if (socket) await sendStopTyping(socket, chatId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setText(v);
    if (!socket || !chatId) return;
    // Throttle typing emits to at most once per 1s
    if (!typingCooldownRef.current) {
      sendTyping(socket, chatId).catch(() => {});
      typingCooldownRef.current = setTimeout(() => {
        if (typingCooldownRef.current) clearTimeout(typingCooldownRef.current);
        typingCooldownRef.current = null;
      }, 1000);
    }
    // Schedule stopTyping after 1500ms of inactivity
    if (stopTypingRef.current) clearTimeout(stopTypingRef.current);
    stopTypingRef.current = setTimeout(() => {
      if (socket && chatId) sendStopTyping(socket, chatId).catch(() => {});
    }, 1500);
  };




  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="chat-header font-semibold flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/*<span>{headerTitle ?? 'Chat'}</span>*/}
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-ghost">Search</button>
          <button className="btn-ghost">More</button>
        </div>
      {typingUsers.size > 0 && (
        <div className="px-4 py-1 text-[12px] text-muted">Someone is typing…</div>
      )}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-surface">
        {loading && <div className="text-muted">Loading...</div>}
        {!loading && messages.length === 0 && <div className="text-muted">No messages yet</div>}
        {!loading && messages.map(m => {

        })}
        <div className="flex justify ">

        </div>
        <div ref={bottomRef} />
      </div>
      <div className="message-input-container flex items-end gap-2">
        <textarea
          value={text}
          onChange={handleInputChange}
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
