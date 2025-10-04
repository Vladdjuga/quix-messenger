import React from 'react';
import { ChatType, ChatRole } from '@/lib/types';

type Props = {
    title?: string;
    typingUsers: Map<string, string>;
    chatType?: ChatType;
    chatRole?: ChatRole;
    onAddUserClick?: () => void;
}

const ChatHeader : React.FC<Props> = (props:Props)=>{
    const canAddUsers = props.chatType === ChatType.Group && 
                        props.chatRole !== undefined
    return (
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">{props.title || 'Chat'}</h2>
            <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500">
                    {props.typingUsers.size > 0 && (
                        <span>{[...props.typingUsers.values()].join(', ')} {props.typingUsers.size === 1 ? 'is' : 'are'} typing...</span>
                    )}
                </div>
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
            </div>
        </div>
    );
}

export default ChatHeader;