import {Socket} from "socket.io";
import logger from "../../../config/logger.js";
import type {User} from "../../../types/user.js";

export async function onJoinChat(this: Socket, chat: string): Promise<void> {
    const socket = this;

    logger.info(`Client ${socket.id} joining chat: ${chat}`);
    socket.join(chat);
}

export async function onLeaveChat(this: Socket, chat: string): Promise<void> {
    const socket = this;

    logger.info(`Client ${socket.id} leaving chat: ${chat}`);
    socket.leave(chat);
}

export async function onTyping(this: Socket, data: any): Promise<void> {
    const socket = this;
    const authenticatedUser = socket.data.user as User;
    if (!authenticatedUser || !authenticatedUser.id) {
        socket.emit('error', { message: 'Authentication required' });
        return;
    }
    const { chatId,username } = data || {};
    if (!chatId||!username) {
        socket.emit('error', { message: 'Invalid typing payload' });
        return;
    }
    // Emit to others in the room (not the sender)
    socket.to(chatId).emit('typing', { chatId,username, userId: authenticatedUser.id });
}

export async function onStopTyping(this: Socket, data: any): Promise<void> {
    const socket = this;
    const authenticatedUser = socket.data.user as User;
    if (!authenticatedUser || !authenticatedUser.id) {
        socket.emit('error', { message: 'Authentication required' });
        return;
    }
    const { chatId } = data || {};
    if (!chatId) {
        socket.emit('error', { message: 'Invalid stopTyping payload' });
        return;
    }
    socket.to(chatId).emit('stopTyping', { chatId, userId: authenticatedUser.id });
}