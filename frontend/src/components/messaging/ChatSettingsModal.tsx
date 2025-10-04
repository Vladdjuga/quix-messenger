"use client";
import React, {useEffect, useState} from "react";
import {api} from "@/app/api";
import {ChatRole, ChatType} from "@/lib/types";
import {ChatParticipantDto} from "@/lib/dto/chat/ChatManagementDto";
import {AxiosError} from "axios";
import {useCurrentUser} from "@/lib/hooks/data/user/userHook";
import {getProtectedAvatarUrl} from "@/lib/utils/protectedAvatar";
import ChatParticipantsList from "./ChatParticipantsList";

interface ChatSettingsModalProps {
    chatId: string;
    chatType: ChatType;
    currentTitle: string;
    currentUserRole: ChatRole;
    onClose: () => void;
    onUpdated?: () => void;
}

export default function ChatSettingsModal({
    chatId,
    chatType,
    currentTitle,
    currentUserRole,
    onClose,
    onUpdated
}: ChatSettingsModalProps) {
    const { user } = useCurrentUser();
    const [title, setTitle] = useState(currentTitle);
    const [participants, setParticipants] = useState<ChatParticipantDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load participants
    useEffect(() => {
        const loadParticipants = async () => {
            try {
                setLoading(true);
                const data = await api.chats.getParticipants(chatId);
                const mappedData = await Promise.all(
                    data.map(async el => {
                        return {
                            ...el,
                            avatarUrl: (await getProtectedAvatarUrl(el.userId)) ?? undefined,
                        };
                    })
                );
                setParticipants(mappedData);
            } catch (err) {
                console.error("Failed to load participants:", err);
                setError("Failed to load participants");
            } finally {
                setLoading(false);
            }
        };

        loadParticipants();
    }, [chatId]);

    const handleUpdateTitle = async () => {
        if (title.trim() === currentTitle) {
            return; // No changes
        }

        setUpdating(true);
        setError(null);

        try {
            await api.chats.update({ chatId, title: title.trim() });
            onUpdated?.();
            onClose();
        } catch (err) {
            console.error("Failed to update chat:", err);
            if (err instanceof AxiosError) {
                setError(err.response?.data?.message || "Failed to update chat");
            }
        } finally {
            setUpdating(false);
        }
    };

    const handleKickUser = async (userId: string, username: string) => {
        if (!confirm(`Are you sure you want to remove ${username} from this chat?`)) {
            return;
        }

        try {
            await api.chats.removeUser({ chatId, userId });
            setParticipants(prev => prev.filter(p => p.userId !== userId));
            onUpdated?.();
        } catch (err) {
            console.error("Failed to remove user:", err);
            if (err instanceof AxiosError) {
                setError(err.response?.data?.message || "Failed to remove user");
            }
        }
    };

    const canEditTitle = currentUserRole <= ChatRole.Moderator;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-surface border border-default rounded-lg shadow-xl p-6 w-[600px] max-h-[700px] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-primary">Chat Settings</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-muted hover:text-primary transition-colors"
                        aria-label="Close"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-error/10 border border-error rounded-lg text-error text-sm">
                        {error}
                    </div>
                )}

                {/* Only show for Group chats */}
                {chatType === ChatType.Group && (
                    <>
                        {/* Title Section */}
                        <div className="mb-6">
                            <label className="label">
                                <span className="label-text font-medium">Chat Title</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    disabled={!canEditTitle || updating}
                                    className="input input-bordered flex-1 focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Enter chat title..."
                                />
                                {canEditTitle && title !== currentTitle && (
                                    <button
                                        onClick={handleUpdateTitle}
                                        disabled={updating || !title.trim()}
                                        className="btn btn-primary"
                                    >
                                        {updating ? (
                                            <>
                                                <span className="loading loading-spinner loading-sm"></span>
                                                Saving...
                                            </>
                                        ) : (
                                            "Save"
                                        )}
                                    </button>
                                )}
                            </div>
                            {!canEditTitle && (
                                <label className="label">
                                    <span className="label-text-alt text-muted">
                                        Only admins and moderators can change the title
                                    </span>
                                </label>
                            )}
                        </div>

                        {/* Participants Section */}
                        <ChatParticipantsList
                            participants={participants}
                            currentUserId={user?.id}
                            currentUserRole={currentUserRole}
                            loading={loading}
                            onKickUser={handleKickUser}
                        />
                    </>
                )}

                {/* Close Button */}
                <div className="flex justify-end mt-6">
                    <button
                        onClick={onClose}
                        className="btn btn-ghost"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
