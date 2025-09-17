import { io, Socket } from "socket.io-client";
import { getToken } from "@/app/api/token";
import {refreshAuthTokenUseCase} from "@/lib/usecases/auth/refreshTokenUseCase";

let socket: Socket | null = null;

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

export const initSocket = () => {
    if (!socket) {
        const token = getToken();
        socket = io(SOCKET_URL, {
            auth: { token },
            transports: ["websocket"],
            autoConnect: true,
        });

        socket.on("connect", () => console.log("Socket connected:", socket!.id));
        socket.on("disconnect", () => console.log("Socket disconnected"));
        socket.on("connect_error", (err) => console.error("Socket connection error:", err));
        socket.on("error", (err) => console.error("Socket connection error:", err));
        socket.on("unauthorized", async (err) =>{
            console.error("Socket connection error:", err);
            // Try refreshing the token
            const token = await refreshAuthTokenUseCase();
            refreshSocketAuth(token);
        });
    }
    return socket;
};
export const getSocket = () => {
    if (!socket) throw new Error("Socket not initialized yet");
    return socket;
};

// Update socket auth with a new token and reconnect to apply it
export const refreshSocketAuth = (newToken: string | null) => {
    if (!socket) return;
    // Update auth payload for next handshake
    socket.auth = { token: newToken };
    try {
        if (socket.connected) {
            socket.disconnect();
        }
    } catch {}
    // Reconnect will use the updated auth token
    socket.connect();
};