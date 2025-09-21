import type {NextFunction, Request, Response} from 'express';
import {User} from "../types/user.js";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'some-default-secret'; // Ensure you set this in your environment variables

export interface AuthenticatedRequest extends Request {
    user?: User; // Optional user property to hold authenticated user info
    token?: string; // Optional token property to hold the JWT token
}

/**
 * Middleware to authenticate requests using JWT.
 * It checks for the presence of a Bearer token in the Authorization header,
 * verifies the token, and attaches the user information to the request object.
 *
 * @param req - The incoming request object.
 * @param res - The response object.
 * @param next - The next middleware function in the stack.
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized: Missing token' });
    return;
  }
  const token = authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Unauthorized: Missing token' });
        return;
    }
  try {
    (req as AuthenticatedRequest).user = User.fromJson(jwt.verify(token, JWT_SECRET)); // Cast the verified token to User type
    // Save token for outbound service calls
    (req as AuthenticatedRequest).token = token;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
    return;
  }
  next();
};