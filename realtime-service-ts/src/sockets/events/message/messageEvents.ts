import type {Socket} from "socket.io";
import {messageServiceClient} from "../../../clients/index.js";
import logger from "../../../config/logger.js"
import {validate} from "class-validator";
import {plainToInstance} from "class-transformer";
import type {User} from "../../../types/user.js";
import { NewMessageDto } from "../../../types/dto/NewMessageDto.js";
import { UnauthorizedError } from "../../../clients/errors.js";
import { MessageStatus } from "../../../types/enum.js";
import {getIO} from "../../../io.js";

export async function onMessageSent(
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

    // Validate only the required fields for creating a message
    const createDto = plainToInstance(NewMessageDto, data);
    const errors = await validate(createDto);

    if (errors.length > 0) {
        logger.error(`Validation errors: ${errors}`);
        socket.emit('error', {message: 'Invalid message format', details: errors});
        return;
    }
    try {
        // Log the incoming message data
        logger.info(`Received message from authenticated user ${authenticatedUser.id}:`, data);

        // Use bearer token captured during socket auth
        const token = socket.data.token as string | undefined;
        if (!token) {
            logger.error(`Missing bearer token for user ${authenticatedUser.id}`);
            socket.emit('error', {message: 'Authentication required'});
            return;
        }

        // Call message-service REST API to add a message
        const result = await messageServiceClient.addMessage({
            chatId: createDto.chatId,
            text: createDto.text,
            userId: authenticatedUser.id,
            token
        });
        if (!result || !result.id) {
            logger.error(`Failed to send message to server for user ${authenticatedUser.id}`);
            socket.emit('error', {message: 'Failed to send message'});
            return;
        }
        // Emit the message to the room with enriched payload
        // Note: We emit to all in the room including sender; client should handle duplicates if needed
        getIO().to(createDto.chatId).emit('newMessage', {
            senderId: authenticatedUser.id,
            message: {
                id: result.id,
                chatId: result.chatId,
                text: result.text,
                userId: result.userId,
                createdAt: result.createdAt,
                status: result.status,
                localId: createDto.localId // Echo back localId for client-side correlation
            }
        });
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            // Tell client to refresh token; client will emit refreshAuth with a new token
            socket.emit('unauthorized', { message: 'Token expired' });
            return;
        }
        logger.error(`Error sending message for user ${authenticatedUser.id}:`, error);
        socket.emit('error', {message: 'Failed to send message'});
    }
}

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