import React, {useState} from "react";

type Props = {
    placeholder: string,
    onSend: (text:string) => void;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>)=>void;
}

const MessageInput: React.FC<Props> = (props: Props) => {
    const [text,setText] = useState("");

    const handleSendMessage = () => {
        if (text.trim()) {
            setText("");
            props.onSend(text);
        }
    }
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        props.onChange(e);
    }

    return (
        <div className="message-input-container flex items-end gap-2">
        <textarea
            value={text}
            onChange={handleChange}
            rows={1}
            placeholder={props.placeholder}
            onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                }
            }}
            className="flex-1 resize-none input-primary"
        />
            <button onClick={handleSendMessage} disabled={!text.trim()} className="btn-primary disabled:opacity-50">
                Send
            </button>
        </div>
    )
}

export default MessageInput;