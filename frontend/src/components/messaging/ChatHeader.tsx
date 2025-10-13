import React, { useEffect, useMemo, useState } from 'react';
import { ChatType, ChatRole, Participant } from '@/lib/types';
import { useUserPresencePolling } from '@/lib/hooks/data/user/useUserPresencePolling';
import { formatLastSeen } from '@/lib/utils/formatLastSeen';
import Image from 'next/image';
import { getProtectedUserAvatarUrl } from '@/lib/utils/protectedAvatar';

type Props = {
    title?: string;
    typingUsers: Map<string, string>;
    chatType?: ChatType;
    chatRole?: ChatRole;
    participants?: Participant[];
    currentUserId?: string;
    onAddUserClick?: () => void;
    onSettingsClick?: () => void;
}

const ChatHeader : React.FC<Props> = (props:Props)=>{
    // Determine other user in direct chat
    const otherUser = useMemo(() => {
        if (props.chatType !== ChatType.Direct) return null;
        const others = (props.participants ?? []).filter(u => u.id !== props.currentUserId);
        return others.length > 0 ? others[0] : null;
    }, [props.chatType, props.participants, props.currentUserId]);

    const otherUserId = otherUser?.id ?? null;
    
    // Poll for online status (only for direct chats)
    const { isOnline, lastSeenAt } = useUserPresencePolling(otherUserId, { intervalMs: 10000 });

    // Avatar state for direct chats
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        if (otherUser?.id) {
            getProtectedUserAvatarUrl(otherUser.id).then(setAvatarUrl);
        } else {
            setAvatarUrl(null);
        }
    }, [otherUser?.id]);

    const canAddUsers = props.chatType === ChatType.Group && 
                        props.chatRole !== undefined;
    const canAccessSettings = props.chatType === ChatType.Group;
    
    // For direct chats, display other user's name
    const displayTitle = otherUser 
        ? `${otherUser.firstName} ${otherUser.lastName}`.trim() || otherUser.username 
        : props.title || 'Chat';

    // For direct chats, show online status
    const statusText = otherUser 
        ? (isOnline ? 'Active now' : (lastSeenAt ? formatLastSeen(lastSeenAt) : null))
        : null;
    
    return (
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3 min-w-0">
                {/* Avatar for direct chats */}
                {otherUser && (
                    <div className="relative flex-shrink-0">
                        {avatarUrl ? (
                            <Image 
                                src={avatarUrl} 
                                alt={otherUser.username}
                                width={48}
                                height={48}
                                className="rounded-full object-cover"
                                unoptimized
                            />
                        ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-lg">
                                    {otherUser.firstName?.[0] || otherUser.username[0].toUpperCase()}
                                </span>
                            </div>
                        )}
                        {/* Online indicator */}
                        {isOnline && (
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                        )}
                    </div>
                )}

                {/* Title and status */}
                <div className="min-w-0">
                    <h2 className="text-lg font-semibold">{displayTitle}</h2>
                    {props.typingUsers.size > 0 ? (
                        <div className="text-sm text-gray-500 italic">
                            <span>{[...props.typingUsers.values()].join(', ')} {props.typingUsers.size === 1 ? 'is' : 'are'} typing...</span>
                        </div>
                    ) : statusText && (
                        <div className="text-sm text-gray-500">
                            {statusText}
                        </div>
                    )}
                </div>
            </div>

            {/* Right section - Action buttons */}
            <div className="flex gap-2">
                    {canAddUsers && props.onAddUserClick && (
                        <button
                            onClick={props.onAddUserClick}
                            className="btn btn-sm btn-primary gap-2"
                            title="Add user to chat"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            Add User
                        </button>
                    )}
                    {canAccessSettings && props.onSettingsClick && (
                        <button
                            onClick={props.onSettingsClick}
                            className="btn btn-sm btn-ghost gap-2"
                            title="Chat settings"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Settings
                        </button>
                    )}
                </div>
        </div>
    );
}

export default ChatHeader;