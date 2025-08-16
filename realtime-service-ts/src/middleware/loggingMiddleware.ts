import type {NextFunction, Request, Response} from 'express';
import logger from '../config/logger.js';

export const loggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    logger.log("http", `${req.method} ${req.originalUrl} - ${res.statusCode}`);
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        logger.info(`Request Body: ${JSON.stringify(req.body)}`);
    }
    if (req.method === 'GET') {
        logger.info(`Query Params: ${JSON.stringify(req.query)}`);
    }
    if (req.method === 'DELETE') {
        logger.info(`Request Params: ${JSON.stringify(req.params)}`);
    }
    logger.debug(`Request Headers: ${JSON.stringify(req.headers)}`);
    logger.debug(`Request IP: ${req.ip}`);
    logger.debug(`Request Time: ${new Date().toISOString()}`);
    next();
}
