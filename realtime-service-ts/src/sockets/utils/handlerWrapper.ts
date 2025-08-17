import { Socket } from "socket.io";

type SocketHandler = (socket: Socket, ...args: any[]) => Promise<void> | void;

export function wrapSocketHandler(handler: SocketHandler) {
    return async (socket: Socket, ...args: any[]) => {
        try {
            await handler(socket, ...args);
        } catch (err: any) {
            console.error("Socket error:", err);
            socket.emit("error", { message: err.message || "Unknown error" });
        }
    };
}