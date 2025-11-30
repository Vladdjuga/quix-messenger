import { Message, MessageStatus, Participant } from "@/lib/types";
import React, { useCallback, useEffect, useState } from "react";
import AttachmentPreview from "@/components/messaging/AttachmentPreview";
import Image from "next/image";
import Link from "next/link";
import { getProtectedUserAvatarUrl } from "@/lib/utils/protectedAvatar";

type Props = {
    message: Message;
    currentUserId: string;
    chatId: string;
    sender?: Participant;
    editMessage: (messageId: string, text: string) => Promise<void>;
    deleteMessage: (messageId: string) => Promise<void>;
}

const MessageBubble = (props: Props) => {
    const { message: m, chatId, sender } = props;

    const own = m.userId === props.currentUserId;
    const isModified = (m.status & MessageStatus.Modified) === MessageStatus.Modified;
    const isDelivered = (m.status & MessageStatus.Delivered) === MessageStatus.Delivered;
    const isSent = (m.status & MessageStatus.Sent) === MessageStatus.Sent;

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingText, setEditingText] = useState<string>("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    const displayName = sender
        ? `${sender.firstName} ${sender.lastName}`.trim() || sender.username
        : 'Unknown User';

    // Load avatar using userId (not avatarUrl)
    useEffect(() => {
        if (sender?.id) {
            getProtectedUserAvatarUrl(sender.id).then(setAvatarUrl);
        } else {
            setAvatarUrl(null);
        }
        // Note: We don't revoke the blob URL on unmount because it's cached
        // and might be needed by other components
    }, [sender?.id]);

    const { editMessage, deleteMessage } = props;

    const handleDelete = useCallback(async () => {
        try {
            await deleteMessage(m.id);
        } catch (e) {
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

    return (
        <div key={m.id} className={`flex ${own ? 'justify-end' : 'justify-start'} items-start gap-2`}>
            {/* Show avatar for received messages on the left */}
            {!own && sender && (
                <Link href={`/profile?username=${sender.username}`} className="flex-shrink-0 mt-1">
                    {avatarUrl ? (
                        <Image
                            src={avatarUrl}
                            alt={displayName}
                            width={32}
                            height={32}
                            className="rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            unoptimized
                        />
                    ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                            <span className="text-white font-semibold text-xs">
                                {sender.firstName?.[0] || sender.username[0].toUpperCase()}
                            </span>
                        </div>
                    )}
                </Link>
            )}

            <div className={`flex flex-col ${own ? 'items-end' : 'items-start'} max-w-[70%]`}>
                {/* Show username for received messages */}
                {!own && sender && (
                    <Link
                        href={`/profile?username=${sender.username}`}
                        className="text-xs font-medium text-gray-600 hover:text-blue-600 transition-colors mb-1 ml-1"
                    >
                        {displayName}
                    </Link>
                )}

                <div className={`flex ${own ? 'flex-row' : 'flex-row'} items-center gap-2`}>
                    {/* Edit/Delete buttons - always on the left side of the bubble */}
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
                            <>
                                {m.text && <div className="mb-2">{m.text}</div>}
                                {m.attachments && m.attachments.length > 0 && (
                                    <div className="flex flex-col gap-2 mt-2">
                                        {m.attachments.map((attachment) => (
                                            <AttachmentPreview
                                                key={attachment.id}
                                                attachment={attachment}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="text-[10px] text-muted mt-1 flex items-center gap-1 ml-1">
                    <span>{(() => {
                        const d = new Date(m.createdAt);
                        const now = new Date();
                        const sameDay = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
                        return sameDay
                            ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ', ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    })()}</span>
                    <div className="flex items-center gap-1">
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

                {/* Show avatar for own messages on the right */}
                {own && sender && (
                    <Link href={`/profile?username=${sender.username}`} className="flex-shrink-0 mt-1">
                        {avatarUrl ? (
                            <Image
                                src={avatarUrl}
                                alt={displayName}
                                width={32}
                                height={32}
                                className="rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                unoptimized
                            />
                        ) : (
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                                <span className="text-white font-semibold text-xs">
                                    {sender.firstName?.[0] || sender.username[0].toUpperCase()}
                                </span>
                            </div>
                        )}
                    </Link>
                )}
            </div>
        </div>
    );
};

export default MessageBubble;