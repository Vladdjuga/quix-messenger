import type {ExtendedError, Socket} from "socket.io";

export const socketErrorHandlingMiddleware = (
    socket: Socket,
    next:(err?: ExtendedError) => void
) => {
    socket.on('error', (err: Error) => {
        console.error('Socket error:', err);
        socket.emit('error', { message: 'An error occurred with the socket connection.' });
        next(err);
    });
    next();
}