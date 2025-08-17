import {Socket} from "socket.io";
import logger from "../../../config/logger.js";

export async function onJoinRoom(socket:Socket,room: string): Promise<void> {
    logger.info(`Client ${socket.id} joining room: ${room}`);
    socket.join(room);
}
export async function onLeaveRoom(socket:Socket,room: string): Promise<void> {
    logger.info(`Client ${socket.id} leaving room: ${room}`);
    socket.leave(room);
}