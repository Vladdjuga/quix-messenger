import logger from '../config/logger.js';
import type { Request, Response, NextFunction } from "express";

export const errorHandlingMiddleware = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Log the error details
    logger.error(`Error: ${message}`);
    logger.error(`Status Code: ${statusCode}`);
    logger.error(`Request Method: ${req.method}`);

    // Send the error response
    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
        error: process.env.NODE_ENV === 'development' ? err : {}, // Hide stack trace in production
    });
    next();
}