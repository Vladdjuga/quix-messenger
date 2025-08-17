import type {User} from "../../types/user.js";
import type {ExtendedError, Socket} from "socket.io";
import jwt from "jsonwebtoken";

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
    const req = socket.handshake; // Access the request object from the socket handshake
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        next(new Error('Unauthorized: Missing token'));
        return;
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        next(new Error('Unauthorized: Missing token'));
        return;
    }
    try {
        socket.data.user = jwt.verify(token, JWT_SECRET) as User; // Cast the verified token to User type
        next();
    } catch (error) {
        next(new Error('Forbidden: Invalid or expired token'));
        return;
    }
    next();
}