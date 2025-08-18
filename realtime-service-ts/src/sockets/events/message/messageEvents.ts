import type {Socket} from "socket.io";
import {Message} from "../../../types/message.js";
import {messageClient} from "../../../clients/index.js";
import logger from "../../../config/logger.js"
import {validate} from "class-validator";
import {plainToInstance} from "class-transformer";

export async function onMessageSent(
    this: Socket,
    data: any
): Promise<void> {
    const socket = this;

    const message = plainToInstance(Message, data);
    const errors = await validate(message);

    if (errors.length > 0) {
        logger.error(`Validation errors: ${errors}`);
        socket.emit('error', {message: 'Invalid message format', details: errors});
        return;
    }
    try {
        // Log the incoming message data
        logger.info(`Received message from ${socket.id}:`, data);
        // Validate the message data
        // Send the message to the server
        const response = await messageClient.sendMessage({
            chatId: data.chatId,
            userId: socket.id,
            text: data.text,
            sentAt: data.sentAt
        });
        if (!response || !response.success) {
            logger.error('Failed to send message to server');
            socket.emit('error', {message: 'Failed to send message'});
            return;
        }
        // Emit the message to the recipient
        socket.to(data.chatId).emit('newMessage', {
            senderId: socket.id,
            message: data,
        });
    } catch (error) {
        logger.error(error);
        socket.emit('error', {message: 'Failed to send message'});
    }
}

export async function onMessageEdited(
    this: Socket,
    data: any
): Promise<void> {
    const socket = this;

    const message = plainToInstance(Message, data);
    const errors = await validate(message);
    if (errors.length > 0) {
        logger.error(`Validation errors: ${errors}`);
        socket.emit('error', {message: 'Invalid message format', details: errors});
        return;
    }
    try {
        // Log the incoming message edit request
        logger.info(`Received edit request from ${socket.id}:`, data);
        // Placeholder implementation for editing a message
        data;
    } catch (error) {
        console.error('Error editing message:', error);
        socket.emit('error', {message: 'Failed to edit message'});
    }
}