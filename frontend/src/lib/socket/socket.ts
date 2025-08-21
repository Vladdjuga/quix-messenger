import { io, Socket } from "socket.io-client";
import { localStorageShim as localStorage } from "@/lib/shims/localStorage";

let socket: Socket | null = null;

export const initSocket = () => {
    if (!socket) {
        const token = localStorage.getItem("jwt");
        socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
            auth: { token },
            autoConnect: true,
        });

        socket.on("connect", () => console.log("Socket connected:", socket!.id));
        socket.on("disconnect", () => console.log("Socket disconnected"));
        socket.on("connect_error", (err) => console.error("Socket connection error:", err));
    }
    return socket;
};
export const getSocket = () => {
    if (!socket) throw new Error("Socket not initialized yet");
    return socket;
};