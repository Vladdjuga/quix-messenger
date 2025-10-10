import type {Socket} from "socket.io";
import {messageServiceClient} from "../../../clients/index.js";
import logger from "../../../config/logger.js"
import type {User} from "../../../types/user.js";
import { UnauthorizedError } from "../../../clients/errors.js";
import { MessageStatus } from "../../../types/enum.js";
import {getIO} from "../../../io.js";

// NOTE: onMessageSent has been removed - messages are now sent via HTTP to backend
// Backend creates message + attachments atomically, then broadcasts via /api/broadcast/newMessage

export async function onMessageEdited(
    this: Socket,
    data: any
): Promise<void> {
    const socket = this;

    // Get authenticated user from socket data
    const authenticatedUser = socket.data.user as User;
    if (!authenticatedUser || !authenticatedUser.id) {
        logger.error(`User not authenticated for socket ${socket.id}`);
        socket.emit('error', {message: 'Authentication required'});
        return;
    }
    try {
        const token = socket.data.token as string | undefined;
        if (!token) {
            logger.error(`Missing bearer token for user ${authenticatedUser.id}`);
            socket.emit('error', {message: 'Authentication required'});
            return;
        }
        const { messageId, chatId, text } = data || {};
        if (!messageId || !chatId || typeof text !== 'string') {
            socket.emit('error', { message: 'Invalid edit payload' });
            return;
        }
        const ok = await messageServiceClient.editMessage({ messageId, text, token });
        if (!ok) {
            socket.emit('error', { message: 'Failed to edit message' });
            return;
        }
        getIO().to(chatId).emit('messageEdited', {
            senderId: authenticatedUser.id,
            message: {
                id: messageId,
                chatId,
                text,
                status: MessageStatus.Modified
            }
        });
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            socket.emit('unauthorized', { message: 'Token expired' });
            return;
        }
        console.error(`Error editing message for user ${authenticatedUser.id}:`, error);
        socket.emit('error', {message: 'Failed to edit message'});
    }
}

export async function onMessageDeleted(
    this: Socket,
    data: any
): Promise<void> {
    const socket = this;
    const authenticatedUser = socket.data.user as User;
    if (!authenticatedUser || !authenticatedUser.id) {
        logger.error(`User not authenticated for socket ${socket.id}`);
        socket.emit('error', { message: 'Authentication required' });
        return;
    }
    const token = socket.data.token as string | undefined;
    if (!token) {
        logger.error(`Missing bearer token for user ${authenticatedUser.id}`);
        socket.emit('error', { message: 'Authentication required' });
        return;
    }
    const { messageId, chatId } = data || {};
    if (!messageId || !chatId) {
        socket.emit('error', { message: 'Invalid delete payload' });
        return;
    }
    try {
        const ok = await messageServiceClient.deleteMessage({ messageId, token });
        if (!ok) {
            socket.emit('error', { message: 'Failed to delete message' });
            return;
        }
        // Inform all clients in the chat room
        getIO().to(chatId).emit('messageDeleted', { messageId, chatId, senderId: authenticatedUser.id });
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            socket.emit('unauthorized', { message: 'Token expired' });
            return;
        }
        logger.error(`Error deleting message for user ${authenticatedUser.id}:`, error);
        socket.emit('error', { message: 'Failed to delete message' });
    }
}