
import React, {useEffect, useRef, useState} from 'react';
import MessageBubble from "@/components/messaging/MessageBubble";
import {Message} from "@/lib/types";

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

    const handleScroll = async () => {
        if (!containerRef.current) return;
        const el = containerRef.current;
        const scrollTop = el.scrollTop;
        const scrollHeight = el.scrollHeight;
        const clientHeight = el.clientHeight;

        const distanceFromBottom = scrollHeight - clientHeight - scrollTop;

        const threshold = 400;
        setShowScrollDown(distanceFromBottom > threshold);

        if (scrollTop < 10) {
            const previousScrollHeight = scrollHeight;
            const loadedCount = await loadMore();

            if (loadedCount > 0) {
                requestAnimationFrame(() => {
                    if (!containerRef.current) return;
                    const newScrollHeight = containerRef.current.scrollHeight;
                    containerRef.current.scrollTop = newScrollHeight - previousScrollHeight;
                });
            }
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
                        position: "sticky",
                        bottom: "15px",
                        right: "15px",
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