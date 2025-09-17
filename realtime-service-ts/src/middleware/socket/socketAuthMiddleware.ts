import {User} from "../../types/user.js";
import type {ExtendedError, Socket} from "socket.io";
import jwt from "jsonwebtoken";
import logger from "../../config/logger.js";

const JWT_SECRET = process.env.JWT_SECRET || 'some-default-secret';

/**
 * Middleware to authenticate WebSocket connections using JWT.
 * It checks for the presence of a Bearer token in the Authorization header,
 * @param socket - The incoming socket connection object.
 * @param next - The next middleware function to call if authentication is successful.
 */
export const socketAuthMiddleware = (
    socket: Socket,
    next:(err?: ExtendedError) => void
) => {
    const token = socket.handshake.auth.token as string | undefined;
    logger.debug(`[${socket.id}] socket handler payload: ${token}`);
    if (!token) {
        socket.emit('unauthorized', new Error('Unauthorized'));
        next(new Error('Unauthorized: Missing token'));
        return;
    } 
    try {
        socket.data.user = User.fromJson(jwt.verify(token, JWT_SECRET)); // Cast the verified token to User type
        logger.debug(`[${socket.id}] socket handler payload: ${JSON.stringify(socket.data.user, null, 2)}`);
        socket.data.token = token; // persist token for outbound service calls
        next();
    } catch (error) {
        logger.error(`Socket authentication error: ${error}`);
        logger.error(error instanceof Error ? error.stack : 'No stack trace available');
        logger.error(`Socket JWT verification failed for token: ${token}`);
        socket.emit('unauthorized', error);
        next(new Error('Forbidden: Invalid or expired token'));
        return;
    }
}