import logger from "../../config/logger.js";
import {getIO} from "../../io.js";


interface EditedMessageDto{
    Id:string;
    Text:string;
    ChatId:string;
    Status:number;
}

interface EditedMessagePayload{
    SenderId:string;
    Message:EditedMessageDto;
}

export async function handleEditedMessageEvent(payload:EditedMessagePayload){
    try{
        const { SenderId, Message } = payload;

        if (!SenderId || !Message) {
            logger.warn(`Invalid new message payload received from Kafka: ${JSON.stringify(payload)}`);
            return;
        }

        logger.info(
            `Broadcasting new message via WebSocket: messageId=${Message.Id}, senderId=${SenderId}`
        );
        getIO().to(Message.ChatId).emit('messageEdited', {
            senderId: SenderId,
            message: {
                id: Message.Id,
                chatId:Message.ChatId,
                text:Message.Text,
                status: Message.Status
            }
        });
        logger.info(`Successfully broadcast message edited ${Message.Id} to chat ${Message.ChatId}`);
    } catch (error) {
        logger.error('Error handling new message event from Kafka:', error);
        // Don't throw - let Kafka consumer continue
    }
}