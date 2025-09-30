import React from "react";

type Props = {
    text: string,
    onSend: () => void;
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>)=>void;
}

const MessageInput: React.FC<Props> = (props: Props) => {
    return (
        <div className="message-input-container flex items-end gap-2">
        <textarea
            value={props.text}
            onChange={props.handleInputChange}
            rows={1}
            placeholder={`Message...`}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); props.onSend(); } }}
            className="flex-1 resize-none input-primary"
        />
            <button onClick={props.onSend} disabled={!props.text.trim()} className="btn-primary disabled:opacity-50">Send</button>
        </div>
    )
}

export default MessageInput;