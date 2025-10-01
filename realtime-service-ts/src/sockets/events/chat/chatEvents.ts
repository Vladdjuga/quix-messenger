import {Socket} from "socket.io";
import logger from "../../../config/logger.js";
import {userServiceClient} from "../../../clients/index.js";
import { UnauthorizedError } from "../../../clients/errors.js";
import type {User} from "../../../types/user.js";

export async function onJoinChat(this: Socket, chat: string): Promise<void> {
    const socket = this;

    logger.info(`Client ${socket.id} joining chat: ${chat}`);
    // Check if the chat exists for the user
    const authenticatedUser = socket.data.user as User;
    if (!authenticatedUser || !authenticatedUser.id) {
        logger.error(`User not authenticated for socket ${socket.id}`);
        socket.emit('error', {message: 'Authentication required'});
        return;
    }
    const token = socket.data.token as string | undefined;
    let isInChat = false;
    try {
        isInChat = token ? await userServiceClient.isUserInChat({
            userId: authenticatedUser.id,
            chatId: chat,
            token
        }) : false;
    } catch (err) {
        if (err instanceof UnauthorizedError) {
            socket.emit('unauthorized', { message: 'Token expired' });
            return;
        }
        throw err;
    }
    if (!isInChat) {
        logger.warn(`User ${authenticatedUser.id} is not in chat ${chat}. Cannot join.`);
        socket.emit('error', {message: `You are not part of chat ${chat}.`});
        return;
    }
    socket.join(chat);
}

export async function onLeaveChat(this: Socket, chat: string): Promise<void> {
    const socket = this;
    logger.info(`Client ${socket.id} leaving chat: ${chat}`);
    // Check if the chat exists for the user
    const authenticatedUser = socket.data.user as User;
    if (!authenticatedUser || !authenticatedUser.id) {
        logger.error(`User not authenticated for socket ${socket.id}`);
        socket.emit('error', {message: 'Authentication required'});
        return;
    }
    const token = socket.data.token as string | undefined;
    let isInChat = false;
    try {
        isInChat = token ? await userServiceClient.isUserInChat({
            userId: authenticatedUser.id,
            chatId: chat,
            token
        }) : false;
    } catch (err) {
        if (err instanceof UnauthorizedError) {
            socket.emit('unauthorized', { message: 'Token expired' });
            return;
        }
        throw err;
    }
    if (!isInChat) {
        logger.warn(`User ${authenticatedUser.id} is not in chat ${chat}. Cannot leave.`);
        socket.emit('error', {message: `You are not part of chat ${chat}.`});
        return;
    }
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