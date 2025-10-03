import React, {useState, useRef, useEffect} from "react";
import CreateChatForm from "@/components/menus/CreateChatForm";


export default function ChatMenuPopOut(props: {
    onChatCreated?: () => void;
}) {
    const [isOpenMenu, setIsOpenMenu] = useState(false);
    const [isCreatingChat, setIsCreatingChat] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpenMenu(false);
            }
        };

        if (isOpenMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpenMenu]);

    const handleNewChatClick = () => {
        setIsCreatingChat(true);
        setIsOpenMenu(false);
    };

    return (
        <div className="relative mt-3" ref={menuRef}>
            {/* Menu Button */}
            <button 
                className="btn btn-primary w-full gap-2 shadow-md hover:shadow-lg transition-all"
                onClick={() => setIsOpenMenu(!isOpenMenu)}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Chat
            </button>

            {/* Dropdown Menu */}
            {isOpenMenu && !isCreatingChat && (
                <div className="absolute top-full left-0 mt-2 w-full bg-surface border border-default rounded-lg shadow-xl z-10 overflow-hidden">
                    <ul className="menu p-0">
                        <li>
                            <button 
                                onClick={handleNewChatClick}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-primary/10 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                </svg>
                                <div className="flex flex-col items-start">
                                    <span className="font-medium">New Group Chat</span>
                                    <span className="text-xs text-muted">Start a conversation</span>
                                </div>
                            </button>
                        </li>
                    </ul>
                </div>
            )}

            {/* Create Chat Form */}
            {isCreatingChat && (
                <CreateChatForm 
                    setIsCreatingChat={setIsCreatingChat}
                    onChatCreated={props.onChatCreated}
                />
            )}
        </div>
    );
}