import type {Socket} from "socket.io";
import {Message} from "../../../types/message.js";
import {messageServiceClient} from "../../../clients/index.js";
import logger from "../../../config/logger.js"
import {validate} from "class-validator";
import {plainToInstance} from "class-transformer";
import type {User} from "../../../types/user.js";
import { NewMessageDto } from "../../../types/dto/NewMessageDto.js";

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
        // Emit the message to the room with enriched payload (includes id and server timestamp)
        socket.to(createDto.chatId).emit('newMessage', {
            senderId: authenticatedUser.id,
            message: {
                id: result.id,
                chatId: createDto.chatId,
                text: createDto.text,
                userId: authenticatedUser.id,
                createdAt: new Date().toISOString(),
                status: 2 // Delivered
            }
        });
    } catch (error) {
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
    const authenticatedUser = socket.data.user;
    if (!authenticatedUser || !authenticatedUser.id) {
        logger.error(`User not authenticated for socket ${socket.id}`);
        socket.emit('error', {message: 'Authentication required'});
        return;
    }

    const message = plainToInstance(Message, data);
    const errors = await validate(message);
    if (errors.length > 0) {
        logger.error(`Validation errors: ${errors}`);
        socket.emit('error', {message: 'Invalid message format', details: errors});
        return;
    }
    try {
        // Log the incoming message edit request
        logger.info(`Received edit request from authenticated user ${authenticatedUser.id}:`, data);
        // Placeholder implementation for editing a message
        data;
    } catch (error) {
        console.error(`Error editing message for user ${authenticatedUser.id}:`, error);
        socket.emit('error', {message: 'Failed to edit message'});
    }
}