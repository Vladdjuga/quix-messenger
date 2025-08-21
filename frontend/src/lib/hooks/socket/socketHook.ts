import {useContext} from "react";
import {SocketContext} from "@/lib/contexts/SocketContext";

// Custom hook to use the socket instance
export const useSocket = () => {
    return useContext(SocketContext);
};