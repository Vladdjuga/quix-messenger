import React from 'react';
import { MessageAttachment } from '@/lib/types';
import Image from "next/image";

type Props = {
    attachment: MessageAttachment;
};

const AttachmentPreview = ({ attachment }: Props) => {
    const isImage = attachment.contentType.startsWith('image/');
    const isVideo = attachment.contentType.startsWith('video/');
    const isAudio = attachment.contentType.startsWith('audio/');
    const isPDF = attachment.contentType === 'application/pdf';
    
    // Format file size
    const formatSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // Get file icon based on type
    const getFileIcon = () => {
        if (isImage) return '🖼️';
        if (isVideo) return '🎥';
        if (isAudio) return '🎵';
        if (isPDF) return '📄';
        if (attachment.contentType.includes('word')) return '📝';
        if (attachment.contentType.includes('excel') || attachment.contentType.includes('spreadsheet')) return '📊';
        if (attachment.contentType.includes('zip') || attachment.contentType.includes('rar')) return '🗜️';
        return '📎';
    };

    const handleDownload = (e: React.MouseEvent) => {
        e.preventDefault();
        const link = document.createElement('a');
        link.href = attachment.url;
        link.download = attachment.name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Pending attachment (not yet uploaded)
    if (!attachment.url || attachment.id.startsWith('pending-')) {
        return (
            <div className="flex items-center gap-2 p-2 rounded bg-gray-100 dark:bg-gray-800 opacity-60">
                <span className="text-2xl">⏳</span>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{attachment.name}</div>
                    <div className="text-xs text-muted">Uploading... {formatSize(attachment.size)}</div>
                </div>
            </div>
        );
    }

    // Image preview
    if (isImage) {
        return (
            <div className="group relative">
                <a 
                    href={attachment.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block rounded-lg overflow-hidden max-w-xs"
                >
                    <Image
                        src={attachment.url} 
                        alt={attachment.name}
                        className="w-full h-auto max-h-64 object-cover hover:opacity-90 transition-opacity"
                        loading="lazy"
                    />
                </a>
                <div className="mt-1 text-xs text-muted truncate">{attachment.name}</div>
                <button
                    onClick={handleDownload}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Download"
                >
                    ⬇️
                </button>
            </div>
        );
    }

    // Video preview
    if (isVideo) {
        return (
            <div className="rounded-lg overflow-hidden max-w-xs">
                <video 
                    controls 
                    className="w-full h-auto max-h-64"
                    preload="metadata"
                >
                    <source src={attachment.url} type={attachment.contentType} />
                    Your browser does not support the video tag.
                </video>
                <div className="mt-1 text-xs text-muted truncate">{attachment.name}</div>
            </div>
        );
    }

    // Audio preview
    if (isAudio) {
        return (
            <div className="flex flex-col gap-2 p-2 rounded bg-gray-100 dark:bg-gray-800">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🎵</span>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{attachment.name}</div>
                        <div className="text-xs text-muted">{formatSize(attachment.size)}</div>
                    </div>
                </div>
                <audio controls className="w-full">
                    <source src={attachment.url} type={attachment.contentType} />
                    Your browser does not support the audio element.
                </audio>
            </div>
        );
    }

    // Generic file preview
    return (
        <a 
            href={attachment.url}
            onClick={handleDownload}
            className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer max-w-xs"
        >
            <span className="text-3xl flex-shrink-0">{getFileIcon()}</span>
            <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{attachment.name}</div>
                <div className="text-xs text-muted">{formatSize(attachment.size)}</div>
            </div>
            <span className="text-xl flex-shrink-0">⬇️</span>
        </a>
    );
};

export default AttachmentPreview;
