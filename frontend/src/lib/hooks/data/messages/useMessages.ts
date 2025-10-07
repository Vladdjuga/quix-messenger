import {useCallback, useContext, useEffect, useRef, useState} from "react";
import {Message, MessageStatus, MessageWithLocalId} from "@/lib/types";
import {api} from "@/app/api";
import {mapReadMessageDtos} from "@/lib/mappers/messageMapper";
import {
    deleteChatMessage,
    editChatMessage,
    joinChat,
    leaveChat,
    onMessageDeleted,
    onMessageEdited,
    onNewMessage,
    sendChatMessage,
    sendStopTyping
} from "@/lib/realtime/chatSocketUseCases";
import {SocketContext} from "@/lib/contexts/SocketContext";
import {useCurrentUser} from "@/lib/hooks/data/user/userHook";
import {mapMessageAttachmentDtos} from "@/lib/mappers/attachmentMapper";

const NEXT_PUBLIC_PAGE_SIZE = parseInt(process.env.NEXT_PUBLIC_PAGE_SIZE || '20', 10);

// Store pending attachment uploads: localId -> files
type PendingUpload = {
    localId: string;
    files: File[];
};

export function useMessages(props: { chatId: string }) {
    const { chatId } = props;
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState<Message[]>([]);
    const socket = useContext(SocketContext);
    const { user, loading: userLoading } = useCurrentUser();
    
    // Store pending uploads that are waiting for real message ID
    const pendingUploadsRef = useRef<Map<string, PendingUpload>>(new Map());

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

    const sendMessage = async (text: string, attachments: File[]) => {
        const value = text.trim();
        if (!value || !chatId) return;
        try {
            const localId = `local-${Date.now()}-${Math.random().toString(36).substring(7)}`;
            const msg: Message = {
                id: localId,
                chatId: chatId,
                text: value,
                userId: user!.id,
                createdAt: new Date(),
                status: MessageStatus.Sent,
                attachments: [],
            };
            
            // If there are attachments, store them for upload after we get the real message ID
            if (attachments && attachments.length > 0) {
                pendingUploadsRef.current.set(localId, { localId, files: attachments });
                // Show pending attachments in UI with placeholder data
                msg.attachments = attachments.map((file, index) => ({
                    id: `pending-${index}`,
                    name: file.name,
                    contentType: file.type,
                    size: file.size,
                    url: '', // Will be populated after upload
                }));
            }
            
            await sendChatMessage(socket, chatId, value, localId);
            addMessage(msg);
            
            // stop typing after sending
            if (socket) await sendStopTyping(socket, chatId);
        } catch (e) {
            console.error(e);
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
    
    // Upload attachments for a message after we receive its real ID
    const uploadAttachmentsForMessage = useCallback(async (messageId: string, files: File[]) => {
        try {
            console.log(`Uploading ${files.length} attachments for message ${messageId}`);
            const attachmentDtos = await api.attachments.upload(messageId, chatId, files);
            
            // Update the message with real attachment data
            setMessages(prev => prev.map(m => 
                m.id === messageId 
                    ? { ...m, attachments: mapMessageAttachmentDtos(attachmentDtos) }
                    : m
            ));
            
            console.log(`Successfully uploaded ${attachmentDtos.length} attachments`);
        } catch (error) {
            console.error('Failed to upload attachments:', error);
            // Update message to show upload failed
            setMessages(prev => prev.map(m => 
                m.id === messageId 
                    ? { ...m, attachments: [] } // Clear pending attachments on error
                    : m
            ));
        }
    }, [chatId]);
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
    const editMessage = useCallback(async (messageId: string, text: string) => {
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
            addMessage(msg);
            
            // Check if this message has pending attachments to upload
            if (msg.localId) {
                const pendingUpload = pendingUploadsRef.current.get(msg.localId);
                if (pendingUpload && pendingUpload.files.length > 0) {
                    // We received the real message ID, now upload attachments
                    console.log(`Message ${msg.id} received from server (was ${msg.localId}), uploading attachments...`);
                    await uploadAttachmentsForMessage(msg.id, pendingUpload.files);
                    // Clean up the pending upload
                    pendingUploadsRef.current.delete(msg.localId);
                }
            }
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
    }, [socket, chatId, addMessage, user, uploadAttachmentsForMessage]);

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