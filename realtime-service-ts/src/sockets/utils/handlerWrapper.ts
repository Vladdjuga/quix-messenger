import { Socket } from "socket.io";
import logger from "../../config/logger.js";

// Type definition for the socket handler
type SocketHandler = (data: any, ...args: any[]) => Promise<void> | void;

export function wrapSocketHandler(handler: SocketHandler) {
    return async function(this: Socket, data: any, ...args: any[]) {
        try {
            // Log the incoming data for debugging purposes
            const dataString = JSON.stringify(data);
            logger.debug(`Socket handler called with data: ${dataString}`);
            logger.debug(`Socket handler called with args: ${args}`);
            // Check if the data is valid
            if (!data || typeof data !== 'object') {
                logger.error(`Invalid socket data received: ${data}`);
                this.emit("error", { message: "Invalid socket data received" });
                return;
            }
            // Call the original handler with the socket context and data
            await handler.call(this,data, ...args);
        } catch (err: any) {
            logger.error(err.stack);
            logger.error("Socket handler error:", err.message || "Unknown error");
            this.emit("error", { message: err.message || "Unknown error" });
        }
    };
}