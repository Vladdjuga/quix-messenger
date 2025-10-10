import { getIO } from '../../io.js';
import logger from '../../config/logger.js';

interface MessageAttachmentDto {
    Id: string;
    Name: string;
    ContentType: string;
    Size: number;
    Url: string;
}

interface BroadcastMessageDto {
    Id: string;
    ChatId: string;
    Text: string;
    UserId: string;
    CreatedAt: string;
    Status: number;
    Attachments: MessageAttachmentDto[];
}

interface BroadcastMessagePayload {
    ChatId: string;
    Message: BroadcastMessageDto;
}

/**
 * Handle new message events from Kafka
 * Note: C# backend sends PascalCase, so we use PascalCase in interface
 */
export async function handleNewMessageEvent(payload: BroadcastMessagePayload): Promise<void> {
    try {
        const { ChatId, Message } = payload;

        if (!ChatId || !Message) {
            logger.warn(`Invalid new message payload received from Kafka: ${JSON.stringify(payload)}`);
            return;
        }

        logger.info(
            `Broadcasting new message via WebSocket: messageId=${Message.Id}, chatId=${ChatId}, userId=${Message.UserId}`
        );

        // Emit to Socket.io room (all clients in this chat)
        const io = getIO();
        io.to(ChatId).emit('newMessage', {
            senderId: Message.UserId,
            message: {
                id: Message.Id,
                chatId: Message.ChatId,
                text: Message.Text,
                userId: Message.UserId,
                createdAt: Message.CreatedAt,
                status: Message.Status,
                attachments: Message.Attachments?.map(att => ({
                    id: att.Id,
                    name: att.Name,
                    contentType: att.ContentType,
                    size: att.Size,
                    url: att.Url,
                })) || [],
            },
        });

        logger.info(`Successfully broadcast message ${Message.Id} to chat ${ChatId}`);
    } catch (error) {
        logger.error('Error handling new message event from Kafka:', error);
        // Don't throw - let Kafka consumer continue
    }
}
