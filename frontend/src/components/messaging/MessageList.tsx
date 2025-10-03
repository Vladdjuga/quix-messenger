
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
        const scrollTop = containerRef.current.scrollTop;

        const threshold = 400; // px from bottom to consider "at top"
        if (containerRef.current.scrollHeight - containerRef.current.clientHeight - scrollTop > threshold) {
            setShowScrollDown(true);
        }
        else {
            setShowScrollDown(false);
        }

        if (scrollTop === 0) { // At top
            await loadMore(); // Load more messages
            // Maintain scroll position after loading more
            requestAnimationFrame(() => {
                if (!containerRef.current) return;
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
                        position: "fixed",
                        bottom: "120px",
                        right: "70px",
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