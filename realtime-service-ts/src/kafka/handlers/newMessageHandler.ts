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
    message: BroadcastMessageDto;
}

export async function handleNewMessageEvent(payload: BroadcastMessagePayload): Promise<void> {
    try {
        const { message } = payload;
        const { chatId } = message;

        if (!chatId || !message) {
            logger.warn(`Invalid new message payload received from Kafka: ${JSON.stringify(payload)}`);
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
                attachments: message.attachments?.map(att => ({
                    id: att.id,
                    name: att.name,
                    contentType: att.contentType,
                    size: att.size,
                    url: att.url,
                })) || [],
            },
        });

        logger.info(`Successfully broadcast message ${message.id} to chat ${chatId}`);
    } catch (error) {
        logger.error('Error handling new message event from Kafka:', error);
        // Don't throw - let Kafka consumer continue
    }
}
