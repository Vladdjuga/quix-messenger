import {useCallback, useContext, useEffect, useState} from "react";
import {Message, MessageStatus, MessageWithLocalId} from "@/lib/types";
import {api} from "@/app/api";
import {mapReadMessageDtos} from "@/lib/mappers/messageMapper";
import {
    deleteChatMessage,
    editChatMessage,
    joinChat, leaveChat, onMessageDeleted,
    onMessageEdited,
    onNewMessage
} from "@/lib/realtime/chatSocketUseCases";
import {SocketContext} from "@/lib/contexts/SocketContext";
import {useCurrentUser} from "@/lib/hooks/data/user/userHook";


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
            const count = 20;
            const resp = await api.messages.last(chatId, count);
            const data = mapReadMessageDtos(resp.data);
            if (mounted) setMessages(data.reverse());
            setLoading(false);
        })();
        return () => { mounted = false; };
    }, [chatId]);

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
    }, [chatId, props.chatId, socket]);
    const editMessage = useCallback(async (text:string,messageId:string) => {
        if (!chatId || !messageId) return;
        const newText = text.trim();
        if (!newText) return;
        // Optimistic update: preserve existing flags and mark as modified
        setMessages(prev => prev.map(m => m.id === messageId ? 
            { ...m, text: newText, status: (m.status | MessageStatus.Modified) } : m));
        try {
            if (socket) {
                await editChatMessage(socket, chatId, messageId, newText);
            }
        } catch (e) {
            console.error('Failed to edit message', e);
        } 
    }, [chatId, socket]);

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
        deleteMessage,
        editMessage
    }

}