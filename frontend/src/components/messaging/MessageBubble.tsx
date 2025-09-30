import {Message, MessageStatus} from "@/lib/types";
import React, {useCallback, useState} from "react";
import {useMessages} from "@/lib/hooks/data/messages/useMessages";

type Props = {
    message: Message;
    currentUserId: string;
    chatId: string;
}

const MessageBubble = (props: Props) => {
    const { message: m, chatId } = props;

    const own = m.userId === props.currentUserId;
    const isModified = (m.status & MessageStatus.Modified) === MessageStatus.Modified;
    const isDelivered = (m.status & MessageStatus.Delivered) === MessageStatus.Delivered;
    const isSent = (m.status & MessageStatus.Sent) === MessageStatus.Sent;

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingText, setEditingText] = useState<string>("");

    const { editMessage, deleteMessage, loading } = useMessages({chatId});

    const handleDelete = useCallback(async () => {
        try{
            await deleteMessage(m.id);
        } catch(e) {
            console.error('Failed to delete message', e);
        }
    }, [deleteMessage, m.id]);

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
       try {
            await editMessage(editingId, newText);
        } catch (e) {
            console.error('Failed to edit message', e);
        } finally {
            setEditingId(null);
            setEditingText("");
        }
    }, [chatId, editMessage, editingId, editingText]);


    if(loading) {
        return <div>Loading...</div>;
    }

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
                        onClick={() => handleDelete()}
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
                <div className="text-[10px] text-muted mt-1 flex items-center gap-1">
                    <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {(isModified || (own && (isSent || isDelivered))) && <span>•</span>}
                    {isModified && <span>edited</span>}
                    {own && (isSent || isDelivered) && (
                        <>
                            {isModified && <span>•</span>}
                            <span title={isDelivered ? 'Delivered' : 'Sent'}>{isDelivered ? '✓✓' : '✓'}</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default MessageBubble;