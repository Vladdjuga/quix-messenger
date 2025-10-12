import logger from "../../config/logger.js";
import {getIO} from "../../io.js";


interface DeleteMessagePayload {
    ChatId: string;
    MessageId: string;
    SenderId: string;
}

export async function handleMessageDeletedEvent(payload: DeleteMessagePayload): Promise<void> {
    try{
        const { ChatId,MessageId,SenderId } = payload;
        if(!ChatId || !MessageId || !SenderId){
            logger.warn(`Invalid new message payload received from Kafka: ${JSON.stringify(payload)}`);
        }
        logger.info(
            `Broadcasting new message via WebSocket: messageId=${MessageId}, senderId=${SenderId}`
        );
        getIO().to(ChatId).emit('messageDeleted', { messageId:MessageId, chatId:ChatId, senderId: SenderId });
        logger.info(`Successfully broadcast message deleted ${MessageId} to chat ${ChatId}`);
    }catch (error) {
        logger.error('Error handling new message event from Kafka:', error);
        // Don't throw - let Kafka consumer continue
    }
}