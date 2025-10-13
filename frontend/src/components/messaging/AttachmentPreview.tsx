import React, {useEffect, useState} from 'react';
import { MessageAttachment } from '@/lib/types';
import Image from "next/image";
import {getProtectedAttachmentBlobUrl} from "@/lib/utils/protectedAvatar";

type Props = {
    attachment: MessageAttachment;
};

const AttachmentPreview = ({ attachment }: Props) => {
    const [protectedUrl, setProtectedUrl] = useState<string | null>(null);
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        let isMounted = true;
        (async () => {
            const url = await getProtectedAttachmentBlobUrl(attachment.id);
            if (isMounted) setProtectedUrl(url);
        })();
        return () => { isMounted = false; };
    }, [attachment.id]);

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

    // Get file icon and color based on type
    const getFileInfo = () => {
        if (isImage) return { icon: '🖼️', color: 'bg-blue-50 border-blue-200 hover:bg-blue-100' };
        if (isVideo) return { icon: '🎥', color: 'bg-purple-50 border-purple-200 hover:bg-purple-100' };
        if (isAudio) return { icon: '🎵', color: 'bg-green-50 border-green-200 hover:bg-green-100' };
        if (isPDF) return { icon: '📄', color: 'bg-red-50 border-red-200 hover:bg-red-100' };
        if (attachment.contentType.includes('word')) return { icon: '📝', color: 'bg-blue-50 border-blue-200 hover:bg-blue-100' };
        if (attachment.contentType.includes('excel') || attachment.contentType.includes('spreadsheet')) 
            return { icon: '📊', color: 'bg-green-50 border-green-200 hover:bg-green-100' };
        if (attachment.contentType.includes('zip') || attachment.contentType.includes('rar')) 
            return { icon: '🗜️', color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100' };
        return { icon: '📎', color: 'bg-gray-50 border-gray-200 hover:bg-gray-100' };
    };

    const handleDownload = (e: React.MouseEvent) => {
        e.preventDefault();
        const link = document.createElement('a');
        if (protectedUrl != null) {
            link.href = protectedUrl;
        }
        link.download = attachment.name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Pending attachment (not yet uploaded)
    if (!attachment.url || attachment.id.startsWith('pending-')) {
        return (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 shadow-sm max-w-xs">
                <div className="animate-spin text-2xl">⏳</div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-700 truncate">{attachment.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Uploading... {formatSize(attachment.size)}</div>
                </div>
                <div className="w-8 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 animate-pulse rounded-full" style={{width: '60%'}}></div>
                </div>
            </div>
        );
    }

    // Image preview
    if (isImage) {
        if(!protectedUrl) {
            return (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200 shadow-sm max-w-xs">
                    <span className="text-2xl">❌</span>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-red-700 truncate">{attachment.name}</div>
                        <div className="text-xs text-red-500 mt-0.5">Failed to load image</div>
                    </div>
                </div>
            );
        }

        return (
            <div className="group relative max-w-xs">
                <a 
                    href={attachment.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-200"
                >
                    {!imageLoaded && (
                        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
                            <span className="text-3xl">🖼️</span>
                        </div>
                    )}
                    <Image
                        src={protectedUrl}
                        alt={attachment.name}
                        width={300}
                        height={300}
                        className={`w-full h-auto max-h-72 object-cover transition-all duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => setImageLoaded(true)}
                        unoptimized
                    />
                </a>
                <div className="mt-2 px-1 text-xs text-gray-600 truncate font-medium">{attachment.name}</div>
                <button
                    onClick={handleDownload}
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full p-2.5 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white hover:scale-110"
                    title="Download"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                </button>
            </div>
        );
    }

    // Video preview
    if (isVideo) {
        if(!protectedUrl) {
            return (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200 shadow-sm max-w-xs">
                    <span className="text-2xl">❌</span>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-red-700 truncate">{attachment.name}</div>
                        <div className="text-xs text-red-500 mt-0.5">Failed to load video</div>
                    </div>
                </div>
            );
        }
        return (
            <div className="max-w-xs">
                <div className="rounded-xl overflow-hidden shadow-md border border-purple-200">
                    <video 
                        controls 
                        className="w-full h-auto max-h-72 bg-black"
                        preload="metadata"
                    >
                        <source src={protectedUrl} type={attachment.contentType} />
                        Your browser does not support the video tag.
                    </video>
                </div>
                <div className="mt-2 px-1 flex items-center gap-2">
                    <span className="text-sm">🎥</span>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-600 truncate font-medium">{attachment.name}</div>
                        <div className="text-xs text-gray-400">{formatSize(attachment.size)}</div>
                    </div>
                </div>
            </div>
        );
    }

    // Audio preview
    if (isAudio) {
        if(!protectedUrl) {
            return (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200 shadow-sm max-w-xs">
                    <span className="text-2xl">❌</span>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-red-700 truncate">{attachment.name}</div>
                        <div className="text-xs text-red-500 mt-0.5">Failed to load audio</div>
                    </div>
                </div>
            );
        }
        return (
            <div className="flex flex-col gap-2 p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 shadow-sm max-w-xs">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center">
                        <span className="text-xl">🎵</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-800 truncate">{attachment.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{formatSize(attachment.size)}</div>
                    </div>
                </div>
                <audio controls className="w-full h-8">
                    <source src={protectedUrl} type={attachment.contentType} />
                    Your browser does not support the audio element.
                </audio>
            </div>
        );
    }

    // Generic file preview
    const fileInfo = getFileInfo();
    
    return (
        <a 
            href={attachment.url}
            onClick={handleDownload}
            className={`group flex items-center gap-3 p-4 rounded-xl border-2 shadow-sm transition-all duration-200 cursor-pointer max-w-xs ${fileInfo.color}`}
        >
            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                <span className="text-2xl">{fileInfo.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-800 truncate">{attachment.name}</div>
                <div className="text-xs text-gray-500 mt-1">{formatSize(attachment.size)}</div>
            </div>
            <div className="flex-shrink-0 bg-white rounded-full p-2 shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-200">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
            </div>
        </a>
    );
};

export default AttachmentPreview;
