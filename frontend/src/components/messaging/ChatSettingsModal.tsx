"use client";
import React, {useEffect, useState} from "react";
import {api} from "@/app/api";
import {ChatRole, ChatType} from "@/lib/types";
import {ChatParticipantDto} from "@/lib/dto/chat/ChatManagementDto";
import {AxiosError} from "axios";
import {useCurrentUser} from "@/lib/hooks/data/user/userHook";
import {getProtectedChatAvatarUrl, getProtectedUserAvatarUrl} from "@/lib/utils/protectedAvatar";
import ChatParticipantsList from "./ChatParticipantsList";
import Image from "next/image";
import AvatarUploadModal from "@/components/profile/AvatarUploadModal";

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
    const {user} = useCurrentUser();
    const [title, setTitle] = useState(currentTitle);
    const [participants, setParticipants] = useState<ChatParticipantDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [avatarOpen, setAvatarOpen] = useState(false);

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
                            avatarUrl: (await getProtectedUserAvatarUrl(el.userId)) ?? undefined,
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
        const loadChatAvatar = async ()=>{
            try{
                setLoading(true);
                const url = await getProtectedChatAvatarUrl(chatId);
                setAvatarUrl(url);
            }catch(err){
                console.error("Failed to load chat:", err);
                setError("Failed to load chat");
            }finally {
                setLoading(false);
            }
        }
        loadParticipants();
        loadChatAvatar();
    }, [chatId]);

    const handleUpdateTitle = async () => {
        if (title.trim() === currentTitle) {
            return; // No changes
        }

        setUpdating(true);
        setError(null);

        try {
            await api.chats.update({chatId, title: title.trim()});
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
            await api.chats.removeUser({chatId, userId});
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
            <AvatarUploadModal
                open={avatarOpen}
                onClose={() => setAvatarOpen(false)}
                onUpload={async (file) => {
                    const resp = await api.chats.uploadAvatar(chatId,file);
                    if (!resp.data) return;

                    setAvatarUrl(resp.data.avatarUrl);
                    setAvatarOpen(false);
                }}
            />
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"/>
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
                        {/* Chat Avatar Section */}
                        <div className="mb-8 flex flex-col items-center">
                            <div 
                                className={`relative group ${canEditTitle ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                onClick={() => canEditTitle && setAvatarOpen(true)}
                            >
                                {/* Avatar Container */}
                                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-base-200 border-4 border-base-300 shadow-lg">
                                    {avatarUrl ? (
                                        <Image
                                            src={avatarUrl}
                                            alt={currentTitle}
                                            width={128}
                                            height={128}
                                            className="w-full h-full object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                                            <span className="text-5xl font-bold text-primary">
                                                {currentTitle[0]?.toUpperCase() ?? '#'}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {/* Hover Overlay - Only show if user can edit */}
                                    {canEditTitle && (
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                            <div className="text-center text-white">
                                                <svg 
                                                    className="w-10 h-10 mx-auto mb-1" 
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path 
                                                        strokeLinecap="round" 
                                                        strokeLinejoin="round" 
                                                        strokeWidth={2} 
                                                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
                                                    />
                                                    <path 
                                                        strokeLinecap="round" 
                                                        strokeLinejoin="round" 
                                                        strokeWidth={2} 
                                                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
                                                    />
                                                </svg>
                                                <span className="text-xs font-medium">
                                                    {avatarUrl ? 'Change' : 'Upload'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Edit Badge - Only show if user can edit */}
                                {canEditTitle && (
                                    <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-2 shadow-lg border-2 border-surface group-hover:scale-110 transition-transform">
                                        <svg 
                                            className="w-4 h-4 text-primary-content" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth={2} 
                                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" 
                                            />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            
                            {/* Avatar Helper Text */}
                            {canEditTitle ? (
                                <p className="text-xs text-muted mt-3 text-center">
                                    Click to {avatarUrl ? 'change' : 'upload'} chat avatar
                                </p>
                            ) : (
                                <p className="text-xs text-muted mt-3 text-center">
                                    Only admins and moderators can change the avatar
                                </p>
                            )}
                        </div>

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
