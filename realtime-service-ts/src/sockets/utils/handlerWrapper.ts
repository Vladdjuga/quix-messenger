import { Socket } from "socket.io";
import logger from "../../config/logger.js";

// Type definition for the socket handler (expects `this` to be the Socket)
type SocketHandler = (this: Socket, data: any, ...args: any[]) => Promise<void> | void;

export function wrapSocketHandler(handler: SocketHandler) {
    // Important: return a normal function (not an arrow) so `this` is bound to the Socket by socket.io
    return async function(this: Socket, data: any, ...args: any[]) {
        try {
            // Log the incoming payload (supports primitives and objects)
            const dataString = (() => {
                try { return JSON.stringify(data); } catch { return String(data); }
            })();
            logger.debug(`[${this.id}] socket handler payload: ${dataString}`);
            logger.debug(`[${this.id}] socket handler args: ${JSON.stringify(args)}`);

            // Minimal guard: allow falsy values like 0 or '' if handler expects them, but block completely missing payload
            if (typeof data === 'undefined' && args.length === 0) {
                logger.warn(`[${this.id}] No payload provided to socket handler.`);
                this.emit("error", { message: "No payload provided" });
                return;
            }

            // Call the original handler with the socket context and data
            await handler.call(this, data, ...args);
        } catch (err: any) {
            logger.error(err?.stack);
            logger.error("Socket handler error:", err?.message || "Unknown error");
            this.emit("error", { message: err?.message || "Unknown error" });
        }
    };
}