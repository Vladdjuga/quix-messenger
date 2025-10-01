import React from 'react';

type Props = {
    title?: string;
    typingUsers: Map<string, string>;
}

const ChatHeader : React.FC<Props> = (props:Props)=>{
    return (
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">{props.title || 'Chat'}</h2>
            <div className="text-sm text-gray-500">
                {props.typingUsers.size > 0 && (
                    <span>{[...props.typingUsers.values()].join(', ')} {props.typingUsers.size === 1 ? 'is' : 'are'} typing...</span>
                )}
            </div>
        </div>
    );
}

export default ChatHeader;