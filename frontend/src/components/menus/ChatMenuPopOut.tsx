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
                New Group
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <div className="flex flex-col items-start">
                                    <span className="font-medium">Create Group Chat</span>
                                    <span className="text-xs text-muted">Chat with multiple people</span>
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