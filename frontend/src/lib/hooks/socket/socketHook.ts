import {useContext} from "react";
import {SocketContext} from "@/lib/contexts/SocketContext";

// Custom hook to use the socket instance
export const useSocket = () => {
    const socket = useContext(SocketContext);
    if (!socket) throw new Error("useSocket must be used within a SocketProvider");
    return socket;
};