
import React, {useEffect, useLayoutEffect, useRef} from 'react';
import MessageBubble from "@/components/messaging/MessageBubble";
import {Message} from "@/lib/types";

type Props = {
    chatId: string;
    currentUserId: string;
    messages: Message[];
    deleteMessage: (messageId: string) => Promise<void>;
    editMessage: (messageId: string, newText: string) => Promise<void>;
}

const MessageList : React.FC<Props> = (props:Props) => {
    const {chatId,currentUserId,messages,editMessage,deleteMessage}=props;
    const bottomRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    function scrollToBottom(behavior: ScrollBehavior = 'auto') {
        const el = containerRef.current;
        if (!el) {
            bottomRef.current?.scrollIntoView({ behavior });
            return;
        }
        // Use rAF to ensure layout is up to date
        requestAnimationFrame(() => {
            el.scrollTop = el.scrollHeight;
        });
    }
    // Use layout effect to run after DOM updates, minimizing jumpiness
    useLayoutEffect(() => {
        // Wait a tick to ensure images/fonts/layout settle
        const t = setTimeout(() => scrollToBottom('auto'), 0);
        return () => clearTimeout(t);
    }, [messages.length]);

    useEffect(() => {
        // Initial mount
        scrollToBottom('auto');
    }, []);

    return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-surface">
            {messages.length === 0 && <div className="text-muted">No messages yet</div>}
            {messages.map(m => {
                return (
                    <MessageBubble
                        key={m.id}
                        message={m}
                        currentUserId={currentUserId}
                        chatId={chatId}
                        deleteMessage={deleteMessage}
                        editMessage={editMessage}
                    />
                );
            })}
            <div ref={bottomRef} />
        </div>
    )
};

export default MessageList;