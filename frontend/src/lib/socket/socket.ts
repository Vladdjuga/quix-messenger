import { io, Socket } from "socket.io-client";
import { getToken } from "@/app/api/token";
import {refreshAuthTokenUseCase} from "@/lib/usecases/auth/refreshTokenUseCase";

let socket: Socket | null = null;
let isRefreshing = false;

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
        // Before each reconnect attempt, update auth with the latest token
        socket.io.on("reconnect_attempt", () => {
            const latest = getToken();
            socket!.auth = { token: latest };
        });
        // Intentionally omit connect_error-based refresh; rely on 'unauthorized' + 'refreshAuth'
        socket.on("error", (err) => console.error("Socket error:", err));
        // Custom 'unauthorized' from server acts like auth-expiring; refresh token then update socket state
        socket.on("unauthorized", async (err) =>{
            console.warn("Socket unauthorized event:", err);
            if (isRefreshing) return;
            isRefreshing = true;
            try {
                const newToken = await refreshAuthTokenUseCase();
                if (newToken) {
                    // Ask server to refresh auth context without full reconnect
                    socket!.emit('refreshAuth', { token: newToken });
                    // Also update client-side handshake for future reconnects
                    refreshSocketAuth(newToken);
                }
            } finally {
                isRefreshing = false;
            }
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
    socket.auth = { token: newToken };
    // Reconnect attempts will include the updated auth
    if (socket.connected) {
        // Force a reconnect to send new auth in handshake
        socket.once("disconnect", () => socket!.connect());
        socket.disconnect();
    } else {
        socket.connect();
    }
};