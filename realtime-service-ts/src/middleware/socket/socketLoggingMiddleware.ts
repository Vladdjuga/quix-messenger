import logger from '../../config/logger.js';
import type {ExtendedError, Socket} from "socket.io";

export const socketLoggingMiddleware = (
    socket: Socket,
    next:(err?: ExtendedError) => void
) => {
    const { id, handshake } = socket;
    const { headers, query } = handshake;

    logger.log("socket", `Socket ID: ${id}`);
    logger.log("socket", `Handshake Headers: ${JSON.stringify(headers)}`);
    logger.log("socket", `Handshake Query: ${JSON.stringify(query)}`);
    logger.debug(`Socket Connection Time: ${new Date().toISOString()}`);
    logger.debug(`Socket IP: ${handshake.address}`);
    logger.debug(`Socket Protocol: ${handshake.headers['sec-websocket-protocol'] || 'N/A'}`);

    next();
}