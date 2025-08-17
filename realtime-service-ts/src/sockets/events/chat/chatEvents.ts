import {Socket} from "socket.io";
import logger from "../../../config/logger.js";
import { chatClient } from "../../../clients/index.js";

export async function onJoinChat(socket:Socket,chat: string): Promise<void> {
    logger.info(`Client ${socket.id} joining chat: ${chat}`);
    // Check if the chat exists for the user
    const userId = socket.data.userId; // Assuming userId is stored in socket data
    const isInChat = await chatClient.userChatExists({
        userId,
        chatId: chat
    })
    if (!isInChat) {
        logger.warn(`User ${userId} is not in chat ${chat}. Cannot join.`);
        socket.emit('error', { message: `You are not part of chat ${chat}.` });
        return;
    }
    socket.join(chat);
}
export async function onLeaveChat(socket:Socket,chat: string): Promise<void> {
    logger.info(`Client ${socket.id} leaving chat: ${chat}`);
    // Check if the chat exists for the user
    const userId = socket.data.userId; // Assuming userId is stored in socket data
    const isInChat = await chatClient.userChatExists({
        userId,
        chatId: chat
    })
    if (!isInChat) {
        logger.warn(`User ${userId} is not in chat ${chat}. Cannot leave.`);
        socket.emit('error', { message: `You are not part of chat ${chat}.` });
        return;
    }
    socket.leave(chat);
}