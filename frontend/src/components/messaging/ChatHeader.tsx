import React from 'react';
import { ChatType, ChatRole } from '@/lib/types';

type Props = {
    title?: string;
    typingUsers: Map<string, string>;
    chatType?: ChatType;
    chatRole?: ChatRole;
    onAddUserClick?: () => void;
    onSettingsClick?: () => void;
}

const ChatHeader : React.FC<Props> = (props:Props)=>{
    const canAddUsers = props.chatType === ChatType.Group && 
                        props.chatRole !== undefined;
    const canAccessSettings = props.chatType === ChatType.Group;
    
    return (
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">{props.title || 'Chat'}</h2>
            <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500">
                    {props.typingUsers.size > 0 && (
                        <span>{[...props.typingUsers.values()].join(', ')} {props.typingUsers.size === 1 ? 'is' : 'are'} typing...</span>
                    )}
                </div>
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
        </div>
    );
}

export default ChatHeader;