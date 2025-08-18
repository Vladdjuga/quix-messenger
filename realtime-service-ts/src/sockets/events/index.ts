import {type Server, Socket} from "socket.io";
import logger from "../../config/logger.js";
import {wrapSocketHandler} from "../utils/handlerWrapper.js";
import {onJoinChat, onLeaveChat} from "./chat/chatEvents.js";
import {onMessageEdited, onMessageSent} from "./message/messageEvents.js";

export function registerEvents(io: Server) {
    io.on('connection', async (socket: Socket) => {
        logger.info(`New client connected: ${socket.id}`);

        // Logging socket events
        socket.onAny((event, ...args) => {
            // catch empty events
            if (args.length === 0 || (event === '' || event === null || event === undefined)) {
                logger.warn(`Received empty event: ${event} from socket ${socket.id}`);
                socket.emit('error', {message: `Empty event received: ${event}`});
            }
            // Log useful information about the event
            logger.info(`Event: ${event}, Args: ${JSON.stringify(args)}`);
        });

        socket.on('disconnect', () => {
            logger.info(`Client disconnected: ${socket.id}`);
        })

        // Wrap socket event handlers
        socket.on('joinChat', wrapSocketHandler(onJoinChat))
        socket.on('leaveChat', wrapSocketHandler(onLeaveChat));

        // Message events
        socket.on('message', wrapSocketHandler(onMessageSent));
        socket.on('editMessage', wrapSocketHandler(onMessageEdited));

        socket.on('error', (error: Error) => {
            logger.error(`Socket error: ${error.message}`);
        });
    })
}