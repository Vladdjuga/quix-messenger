import React, {useState} from "react";
import CreateChatForm from "@/components/menus/CreateChatForm";


export default function ChatMenuPopOut() {
    const [isOpenMenu, setIsOpenMenu] = useState(false);
    const [isCreatingChat, setIsCreatingChat] = useState(false);

    return (
        <div className="flex flex-col h-full bg-surface">
            {isOpenMenu && !isCreatingChat && (
                <div className="absolute top-16 left-4 bg-surface border border-default rounded shadow-lg z-10">
                    <ul className="menu p-2">
                        <li><button onClick={()=>setIsCreatingChat(true)}>New Chat</button></li>
                    </ul>
                </div>
            )}
            { isCreatingChat &&
                <CreateChatForm setIsCreatingChat={setIsCreatingChat}/>
            }

            {/* This is a menu button */}
            <button className={"btn-ghost btn-sm btn ml-2"} onClick={() => setIsOpenMenu(!isOpenMenu)}>
                Menu
            </button>
        </div>
    );
}