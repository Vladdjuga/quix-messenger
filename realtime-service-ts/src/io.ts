// io.ts
import { Server } from "socket.io";
let io: Server;

export function initIO(server: any) {
    io = new Server(server);
    return io;
}

export function getIO() {
    if (!io) throw new Error("IO not initialized");
    return io;
}