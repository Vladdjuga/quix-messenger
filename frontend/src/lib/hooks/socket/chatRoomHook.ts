import {useSocket} from "@/lib/hooks/socket/socketHook";
import {useEffect} from "react";

export const useChatRoom = (
    chatId: string,
    handleNewMessage: (msg:any) => void
) => {
    const socket = useSocket();

    useEffect(() => {
        socket.emit("joinRoom", { chatId });
        socket.on("newMessage", handleNewMessage);

        return () => {
            socket.emit("leaveRoom", { chatId });
            socket.off("message", handleNewMessage);
        };
    }, [chatId, socket]);
};