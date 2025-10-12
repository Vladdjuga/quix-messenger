import logger from "../../config/logger.js";
import {getIO} from "../../io.js";


interface DeleteMessagePayload {
    chatId: string;
    messageId: string;
    senderId: string;
}

export async function handleMessageDeletedEvent(payload: DeleteMessagePayload): Promise<void> {
    try{
        const { chatId,messageId,senderId } = payload;
        if(!chatId || !messageId || !senderId){
            logger.warn(`Invalid new message payload received from Kafka: ${JSON.stringify(payload)}`);
        }
        logger.info(
            `Broadcasting new message via WebSocket: messageId=${messageId}, senderId=${senderId}`
        );
        getIO().to(chatId).emit('messageDeleted', { messageId:messageId, chatId:chatId, senderId: senderId });
        logger.info(`Successfully broadcast message deleted ${messageId} to chat ${chatId}`);
    }catch (error) {
        logger.error('Error handling new message event from Kafka:', error);
        // Don't throw - let Kafka consumer continue
    }
}