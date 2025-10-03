
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import MessageBubble from "@/components/messaging/MessageBubble";
import {Message} from "@/lib/types";
import { SCROLL_THRESHOLD_PX, SCROLL_OFFSET_AFTER_LOAD, SCROLL_SETTLE_DELAY_MS } from "@/lib/constants/pagination";

type Props = {
    chatId: string;
    currentUserId: string;
    messages: Message[];
    deleteMessage: (messageId: string) => Promise<void>;
    editMessage: (messageId: string, newText: string) => Promise<void>;
    loadMore: () => Promise<number>;
}

const MessageList : React.FC<Props> = (props:Props) => {
    const {chatId,currentUserId,messages,editMessage,deleteMessage,loadMore}=props;
    const bottomRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [showScrollDown, setShowScrollDown] = useState(false);

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
        const t = setTimeout(() => scrollToBottom('auto'), SCROLL_SETTLE_DELAY_MS);
        return () => clearTimeout(t);
    }, [messages.length]);

    const handleScroll = async () => {
        if (!containerRef.current) return;
        const scrollTop = containerRef.current.scrollTop;

        if (containerRef.current.scrollHeight - containerRef.current.clientHeight - scrollTop > SCROLL_THRESHOLD_PX) {
            setShowScrollDown(true);
        }

        if (scrollTop === 0) { // At top
            await loadMore(); // Load more messages
            // Maintain scroll position after loading more
            requestAnimationFrame(() => {
                if (!containerRef.current) return;
                containerRef.current.scrollTop = SCROLL_OFFSET_AFTER_LOAD; // Slightly offset to avoid retriggering
            });
        }
    };

    useEffect(() => {
        // Initial mount
        scrollToBottom('auto');
        return () => {
            // Cleanup if needed
        }
    }, []);

    return (
    <div ref={containerRef} onScroll={handleScroll}
         className="flex-1 overflow-y-auto p-4 space-y-2 bg-surface"
            style={{ position: 'relative' }}
    >
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
            {showScrollDown && (
                <button
                    onClick={()=>scrollToBottom()}
                    style={{
                        position: "absolute",
                        bottom: "10px",
                        right: "10px",
                        padding: "10px",
                        backgroundColor: "#007bff",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}
                >
                    ↓
                </button>
            )}
            <div ref={bottomRef} />
        </div>
    )
};

export default MessageList;