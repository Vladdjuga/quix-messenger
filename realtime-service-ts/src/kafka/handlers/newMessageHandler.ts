import { getIO } from '../../io.js';
import logger from '../../config/logger.js';

interface MessageAttachmentDto {
    id: string;
    name: string;
    contentType: string;
    size: number;
    url: string;
}

interface BroadcastMessageDto {
    id: string;
    chatId: string;
    text: string;
    userId: string;
    createdAt: string;
    status: number;
    attachments: MessageAttachmentDto[];
}

interface BroadcastMessagePayload {
    chatId: string;
    message: BroadcastMessageDto;
}

/**
 * Handle new message events from Kafka
 */
export async function handleNewMessageEvent(payload: BroadcastMessagePayload): Promise<void> {
    try {
        const { chatId, message } = payload;

        if (!chatId || !message) {
            logger.warn('Invalid new message payload received from Kafka:', payload);
            return;
        }

        logger.info(
            `Broadcasting new message via WebSocket: messageId=${message.id}, chatId=${chatId}, userId=${message.userId}`
        );

        // Emit to Socket.io room (all clients in this chat)
        const io = getIO();
        io.to(chatId).emit('newMessage', {
            senderId: message.userId,
            message: {
                id: message.id,
                chatId: message.chatId,
                text: message.text,
                userId: message.userId,
                createdAt: message.createdAt,
                status: message.status,
                attachments: message.attachments || [],
            },
        });

        logger.info(`Successfully broadcast message ${message.id} to chat ${chatId}`);
    } catch (error) {
        logger.error('Error handling new message event from Kafka:', error);
        // Don't throw - let Kafka consumer continue
    }
}
