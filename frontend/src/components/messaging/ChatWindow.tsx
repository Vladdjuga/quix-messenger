"use client";
import React, { useEffect, useRef, useState } from "react";
import { Message, MessageStatus } from "@/lib/types";
import { getMessages, sendMessage } from "@/lib/api/messagesApi";

interface ChatWindowProps {
  username: string;
  chatId?: string;
}

// Removed inline fetch helpers in favor of centralized service layer.

const ChatWindow: React.FC<ChatWindowProps> = ({ username, chatId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const effectiveChatId = chatId ?? username; // fallback until real chatId is guaranteed

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
  const data = await getMessages(username);
      if (mounted) setMessages(data);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [username]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const value = text.trim();
    if (!value) return;
    // optimistic message
    const temp: Message = {
      id: `temp-${Date.now()}`,
      text: value,
      userId: 'me',
      chatId: effectiveChatId,
      sentAt: new Date(),
      receivedAt: new Date(),
      status: MessageStatus.Sent
    };
    setMessages(prev => [...prev, temp]);
    setText("");
    try {
  const created = await sendMessage(username, temp.chatId, value);
      setMessages(prev => prev.map(m => m.id === temp.id ? created : m));
    } catch (e) {
      // revert optimistic message on failure
      setMessages(prev => prev.filter(m => m.id !== temp.id));
      // optionally surface error UI later
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4 font-semibold">{username}</div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white">
        {loading && <div className="text-sm text-gray-500">Loading...</div>}
        {!loading && messages.length === 0 && <div className="text-sm text-gray-500">No messages yet</div>}
        {!loading && messages.map(m => {
          const own = m.userId === 'me';
          return (
            <div key={m.id} className={`flex ${own ? 'justify-end' : 'justify-start'}`}> 
              <div className={`px-3 py-2 rounded text-sm max-w-xs whitespace-pre-wrap break-words ${own ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>{m.text}</div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 border-t bg-white flex items-end space-x-2">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={1}
          placeholder={`Message ${username}`}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          className="flex-1 resize-none border rounded px-3 py-2 text-sm focus:outline-none focus:ring"
        />
        <button onClick={handleSend} disabled={!text.trim()} className="px-4 py-2 bg-blue-600 text-white text-sm rounded disabled:opacity-50">Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;
