import logger from "../../config/logger.js";
import {getIO} from "../../io.js";


interface EditedMessageDto{
    id:string;
    text:string;
    chatId:string;
    status:number;
}

interface EditedMessagePayload{
    senderId:string;
    message:EditedMessageDto;
}

export async function handleEditedMessageEvent(payload:EditedMessagePayload){
    try{
        const { senderId, message } = payload;

        if (!senderId || !message) {
            logger.warn(`Invalid new message payload received from Kafka: ${JSON.stringify(payload)}`);
            return;
        }

        logger.info(
            `Broadcasting new message via WebSocket: messageId=${message.id}, senderId=${senderId}`
        );
        getIO().to(message.chatId).emit('messageEdited', {
            senderId: senderId,
            message: {
                id: message.id,
                chatId:message.chatId,
                text:message.text,
                status: message.status
            }
        });
        logger.info(`Successfully broadcast message edited ${message.id} to chat ${message.chatId}`);
    } catch (error) {
        logger.error('Error handling new message event from Kafka:', error);
        // Don't throw - let Kafka consumer continue
    }
}