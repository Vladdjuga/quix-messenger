import { Router } from 'express';
import { getIO } from '../io.js';
import logger from '../config/logger.js';

const router = Router();

/**
 * POST /api/broadcast/newMessage
 * @deprecated This HTTP endpoint is deprecated. Messages are now broadcast via Kafka consumer.
 * The backend publishes to Kafka topic 'messenger.events.newMessage' and this service consumes it.
 * This endpoint is kept for backward compatibility during migration.
 * 
 * Receives new message from user-service and broadcasts via WebSocket
 */
router.post('/newMessage', (req, res): void => {
    try {
        const { chatId, message } = req.body;

        if (!chatId || !message) {
            logger.warn('Invalid broadcast request: missing chatId or message');
            res.status(400).json({ error: 'chatId and message are required' });
            return;
        }

        logger.info(`Broadcasting message ${message.id} to chat ${chatId}`);

        // Broadcast to all clients in the chat room
        getIO().to(chatId).emit('newMessage', {
            senderId: message.userId,
            message: {
                id: message.id,
                chatId: message.chatId,
                text: message.text,
                userId: message.userId,
                createdAt: message.createdAt,
                status: message.status,
                attachments: message.attachments || []
            }
        });

        res.status(200).json({ success: true });
    } catch (error) {
        logger.error('Error broadcasting message:', error);
        res.status(500).json({ error: 'Failed to broadcast message' });
    }
});

export default router;
