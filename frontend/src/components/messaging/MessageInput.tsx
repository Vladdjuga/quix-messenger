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

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getFileIcon = (file: File) => {
        const type = file.type;
        
        if (type.startsWith('image/')) {
            return (
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            );
        } else if (type.startsWith('video/')) {
            return (
                <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            );
        } else if (type === 'application/pdf') {
            return (
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            );
        } else {
            return (
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            );
        }
    };

    return (
        <div className="message-input-container flex flex-col gap-2">
            {/* Attachments Preview Area */}
            {attachedFiles.length > 0 && (
                <div className="bg-surface-elevated rounded-lg p-3 border border-border-subtle">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted">
                            Attachments ({attachedFiles.length})
                        </span>
                        <button
                            onClick={() => setAttachedFiles([])}
                            className="text-xs text-red-500 hover:text-red-600 transition-colors"
                        >
                            Clear all
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {attachedFiles.map((file, index) => (
                            <div
                                key={`${file.name}-${index}`}
                                className="group relative flex items-center gap-2 bg-background border border-border-subtle rounded-lg px-3 py-2 hover:border-accent hover:bg-accent/5 transition-all duration-200 max-w-[280px]"
                            >
                                {/* File Icon */}
                                <div className="flex-shrink-0">
                                    {getFileIcon(file)}
                                </div>
                                
                                {/* File Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-primary truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-muted">
                                        {formatFileSize(file.size)}
                                    </p>
                                </div>

                                {/* Remove Button */}
                                <button
                                    onClick={() => handleRemoveFile(file.name)}
                                    className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100"
                                    title="Remove file"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Row */}
            <div className="flex items-end gap-2">
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
            </div>
        </div>
    )
}

export default MessageInput;