import type {Socket} from "socket.io";
import type {Message} from "../../../types/message.js";
import {messageClient} from "../../../clients/index.js";
import logger from "../../../config/logger.js"

export async function onMessageSent(
  socket: Socket,
  data: Message
): Promise<void> {
  try {
    // Send the message to the server
    const response = await messageClient.sendMessage({
      chatId: data.chatId,
      userId: socket.id,
      text: data.text,
      sentAt: data.sentAt
    });
    if (!response || !response.success) {
      logger.error('Failed to send message to server');
      socket.emit('error', { message: 'Failed to send message' });
      return;
    }
    // Emit the message to the recipient
    socket.to(data.chatId).emit('newMessage', {
      senderId: socket.id,
      message: data,
    });
  } catch (error) {
    logger.error(error);
    socket.emit('error', { message: 'Failed to send message' });
  }
}
export async function onMessageEdited(
  socket: Socket,
  data: Message
): Promise<void> {
  try {
    // Placeholder implementation for editing a message
    data;
  } catch (error) {
    console.error('Error editing message:', error);
    socket.emit('error', { message: 'Failed to edit message' });
  }
}