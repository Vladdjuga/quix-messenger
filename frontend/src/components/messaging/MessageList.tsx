
import React, {useEffect} from 'react';
import {useMessages} from "@/lib/hooks/data/messages/useMessages";
import MessageBubble from "@/components/messaging/MessageBubble";

type Props = {
    chatId: string;
    currentUserId: string;
}

const MessageList : React.FC<Props> = (props:Props) => {
    const {chatId,currentUserId}=props;
    const {messages, loading} = useMessages({chatId}); // Custom hook to fetch messages
    const bottomRef = React.useRef<HTMLDivElement>(null);

    function scrollToBottom() {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-surface">
            {loading && <div className="text-muted">Loading...</div>}
            {!loading && messages.length === 0 && <div className="text-muted">No messages yet</div>}
            {!loading && messages.map(m => {
                return (
                    <MessageBubble key={m.id} message={m} currentUserId={currentUserId} chatId={chatId}/>
                );
            })}
            <div ref={bottomRef} />
        </div>
    )
};

export default MessageList;