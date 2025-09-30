"use client";
import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import {Message, MessageStatus, MessageWithLocalId} from "@/lib/types";
import { api } from "@/app/api";
import { mapReadMessageDtos } from "@/lib/mappers/messageMapper";
import {SocketContext} from "@/lib/contexts/SocketContext";
import {joinChat, leaveChat, onNewMessage, sendChatMessage, deleteChatMessage, onMessageDeleted, editChatMessage, onMessageEdited} from "@/lib/realtime/chatSocketUseCases";
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

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }
  const handleDelete = useCallback(async (messageId: string) => {
    if (!chatId) return;
    // Optimistically remove the message
    setMessages(prev => prev.filter(m => m.id !== messageId));
    try {
      if (socket) {
        await deleteChatMessage(socket, chatId, messageId);
      } else {
        await api.messages.delete(messageId);
      }
    } catch (e) {
      console.error('Failed to delete message', e);
      try {
        const resp = await api.messages.last(chatId, 50);
        const data = mapReadMessageDtos(resp.data);
        setMessages(data);
      } catch {}
    }
  }, [chatId, socket]);


  const startEdit = useCallback((messageId: string, currentText: string) => {
    setEditingId(messageId);
    setEditingText(currentText);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditingText("");
  }, []);

  const saveEdit = useCallback(async () => {
    if (!chatId || !editingId) return;
    const newText = editingText.trim();
    if (!newText) return;
  // Optimistic update: preserve existing flags and mark as modified
  setMessages(prev => prev.map(m => m.id === editingId ? { ...m, text: newText, status: (m.status | MessageStatus.Modified) } : m));
    try {
      if (socket) {
        await editChatMessage(socket, chatId, editingId, newText);
      } else {
        await fetch(`/api/messages/${encodeURIComponent(editingId)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: newText }),
        });
      }
    } catch (e) {
      console.error('Failed to edit message', e);
    } finally {
      setEditingId(null);
      setEditingText("");
    }
  }, [chatId, editingId, editingText, socket]);

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
    if (!socket || !chatId) return;
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
    return () => {
      leaveChat(socket, chatId);
      offNewMessage?.();
      offEdited?.();
      offDeleted?.();
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
          {/*<span>{headerTitle ?? 'Chat'}</span>*/}
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
          const isModified = (m.status & MessageStatus.Modified) === MessageStatus.Modified;
          const isDelivered = (m.status & MessageStatus.Delivered) === MessageStatus.Delivered;
          const isSent = (m.status & MessageStatus.Sent) === MessageStatus.Sent;
          return (
            <div key={m.id} className={`flex ${own ? 'justify-end' : 'justify-start'} items-center gap-2`}>
              {own && (
                <div className="flex gap-1">
                  <button
                    className="btn-ghost text-xs opacity-70 hover:opacity-100"
                    title="Edit message"
                    onClick={() => startEdit(m.id, m.text)}
                  >
                    ✎
                  </button>
                  <button
                    className="btn-ghost text-xs opacity-70 hover:opacity-100"
                    title="Remove message"
                    onClick={() => handleDelete(m.id)}
                  >
                    ✕
                  </button>
                </div>
              )}
              <div className={`flex flex-col ${own ? 'items-end' : 'items-start'}`}>
                <div className={`message-bubble ${own ? 'message-own' : 'message-received'}`}>
                  {editingId === m.id ? (
                    <div className="flex items-end gap-2">
                      <input
                        className="input-primary"
                        value={editingText}
                        onChange={e => setEditingText(e.target.value)}
                      />
                      <button className="btn-primary text-xs" onClick={saveEdit}>Save</button>
                      <button className="btn-secondary text-xs" onClick={cancelEdit}>Cancel</button>
                    </div>
                  ) : (
                    m.text
                  )}
                </div>
                {editingId !== m.id && (isModified || (own && (isSent || isDelivered))) && (
                  <div className="text-[10px] text-muted mt-1 flex items-center gap-1">
                    {isModified && <span>edited</span>}
                    {own && (isSent || isDelivered) && (
                      <>
                        {isModified && <span>•</span>}
                        <span title={isDelivered ? 'Delivered' : 'Sent'}>{isDelivered ? '✓✓' : '✓'}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
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
