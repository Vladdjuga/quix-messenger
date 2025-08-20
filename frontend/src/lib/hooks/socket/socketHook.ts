
// Custom hook to use the socket instance
import {useContext} from "react";
import {SocketContext} from "@/lib/contexts/SocketContext";

export const useSocket = () => {
    const socket = useContext(SocketContext);
    if (!socket) throw new Error("useSocket must be used within a SocketProvider");
    return socket;
};