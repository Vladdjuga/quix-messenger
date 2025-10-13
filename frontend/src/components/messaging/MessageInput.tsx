import React, {useState} from "react";
import FileUploader from "@/components/inputs/FileUploader";

type Props = {
    placeholder: string,
    onSend: (text: string,attachments:File[]) => void;
    onChange: () => void;
}

const MessageInput: React.FC<Props> = (props: Props) => {
    const [text, setText] = useState("");
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

    const handleFilesSelected = (newFiles: File[]) => {
        setAttachedFiles((prev) => [...prev, ...newFiles]);
    };

    const handleSendMessage = () => {
        // Allow sending if there's text OR attachments
        if (text.trim() || attachedFiles.length > 0) {
            props.onSend(text, attachedFiles);
            setText("");
            setAttachedFiles([]);
        }
    }
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        props.onChange();
    }

    const handleRemoveFile = (fileName: string) => {
        setAttachedFiles((prev) => prev.filter(file => file.name !== fileName));
    };

    return (
        <div className="message-input-container flex items-end gap-2">

            {/* Attach files button */}
            <FileUploader onFilesSelected={handleFilesSelected}/>

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
            <button onClick={handleSendMessage} disabled={!text.trim()&&!(attachedFiles.length>0)} className="btn-primary disabled:opacity-50">
                Send
            </button>
            {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {attachedFiles.map((file) => (
                        <div
                            key={file.name}
                            className="flex items-center gap-2 border rounded px-2 py-1 text-sm bg-gray-100"
                        >
                            <span className="truncate max-w-[120px]">{file.name}</span>
                            <button
                                onClick={() => handleRemoveFile(file.name)}
                                className="text-red-500 hover:text-red-700"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MessageInput;