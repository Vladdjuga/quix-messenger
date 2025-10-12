import {useCallback, useContext, useEffect, useState} from "react";
import {Message, MessageStatus, MessageWithLocalId} from "@/lib/types";
import {api} from "@/app/api";
import {mapReadMessageDtos} from "@/lib/mappers/messageMapper";
import {
    joinChat,
    leaveChat,
    onMessageDeleted,
    onMessageEdited,
    onNewMessage,
    sendStopTyping
} from "@/lib/realtime/chatSocketUseCases";
import {SocketContext} from "@/lib/contexts/SocketContext";
import {useCurrentUser} from "@/lib/hooks/data/user/userHook";

const NEXT_PUBLIC_PAGE_SIZE = parseInt(process.env.NEXT_PUBLIC_PAGE_SIZE || '20', 10);

export function useMessages(props: { chatId: string }) {
    const { chatId } = props;
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState<Message[]>([]);
    const socket = useContext(SocketContext);
    const { user, loading: userLoading } = useCurrentUser();

    useEffect(() => {
        let mounted = true;
        (async () => {
            if (!chatId) return;
            setLoading(true);
            const resp = await api.messages.last(chatId, NEXT_PUBLIC_PAGE_SIZE);
            const data = mapReadMessageDtos(resp.data);
            if (mounted) setMessages(data.reverse());
            setLoading(false);
        })();
        return () => { mounted = false; };
    }, [chatId]);

    const sendMessage = async (text: string, attachments: File[]) => {
        const value = text.trim();
        // Allow sending if there's text OR attachments
        const hasAttachments = attachments && attachments.length > 0;
        if ((!value && !hasAttachments) || !chatId) return;
        
        try {
            // Generate temporary ID for optimistic UI
            const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`;
            
            // Create optimistic message
            const optimisticMessage: Message = {
                id: tempId,
                chatId: chatId,
                text: value,
                userId: user!.id,
                createdAt: new Date(),
                status: MessageStatus.Sending, // Show as "sending"
                attachments: hasAttachments 
                    ? attachments.map((file, index) => ({
                        id: `pending-${index}`,
                        name: file.name,
                        contentType: file.type,
                        size: file.size,
                        url: '', // Will be populated after upload
                    }))
                    : [],
            };
            
            // Show optimistic message immediately
            addMessage(optimisticMessage);
            
            // Send to backend (creates message + uploads attachments atomically)
            await api.messages.create(value, chatId, hasAttachments ? attachments : undefined);
            
            // Remove optimistic message (real one will come via WebSocket)
            setMessages(prev => prev.filter(m => m.id !== tempId));
            
            // stop typing after sending
            if (socket) await sendStopTyping(socket, chatId);
        } catch (e) {
            console.error('Failed to send message:', e);
            // Remove optimistic message on error
            setMessages(prev => prev.filter(m => m.status !== MessageStatus.Sending));
            // Could show error toast here
        }
    };

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
    
    const deleteMessage = useCallback(async (messageId: string) => {
        if (!props.chatId) return;
        // Optimistically remove the message
        setMessages(prev => prev.filter(m => m.id !== messageId));
        try {
            await api.messages.delete(messageId);
        } catch (e) {
            console.error('Failed to delete message', e);
            try {
                const resp = await api.messages.last(chatId, NEXT_PUBLIC_PAGE_SIZE);
                const data = mapReadMessageDtos(resp.data);
                setMessages(data);
            } catch {}
        }
    }, [chatId, props.chatId]);
    const editMessage = useCallback(async (messageId: string, text: string) => {
        const newText = text.trim();
        if (!newText) return;
        // Optimistic update: preserve existing flags and mark as modified
        setMessages(prev => prev.map(m => m.id === messageId ? 
            { ...m, text: newText, status: (m.status | MessageStatus.Modified) } : m));
        try {
            await api.messages.edit(messageId, text);
        } catch (e) {
            console.error('Failed to edit message', e);
        } 
    }, []);

    const loadMore = useCallback(async () => {
        try{
            const lastCreatedAt = messages.length > 0 ? messages[0].createdAt : new Date();
            const resp = await api.messages.paginated(chatId,lastCreatedAt,NEXT_PUBLIC_PAGE_SIZE)

            const data = mapReadMessageDtos(resp.data);
            setMessages(prev => [...data.reverse(), ...prev]);
            return data.length;
        } catch(e){
            console.error('Failed to load more messages',e);
            return 0;
        }
    }, [chatId, messages]);

    useEffect(() => {
        if (!socket || !chatId || !user) return;
        joinChat(socket, chatId);
        const offNewMessage = onNewMessage(socket, async (msg) => {
            if (msg.chatId !== chatId) return;
            // Add message from WebSocket (this is the real message from backend)
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
    }, [socket, chatId, addMessage, user]);

    return {
        loading: loading || userLoading,
        messages,
        addMessage,
        sendMessage,
        deleteMessage,
        editMessage,
        loadMore,
    }

}