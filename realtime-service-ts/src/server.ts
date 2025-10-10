import {setupMiddleware} from "./middleware/index.js";
import {setupRoutes} from "./routes/index.js";
import {setupSocket} from "./sockets/index.js";
import {initializeKafka, shutdownKafka} from "./kafka/index.js";
import express from "express";
import * as http from "node:http";
import {initIO} from "./io.js";
import logger from "./config/logger.js";

export function startServer(port:number|string){
    const app = express();
    const server = http.createServer(app);

    const io = initIO(server);

    // Middleware
    setupMiddleware(app);

    // Routes
    setupRoutes(app);

    //Socket.IO setup
    setupSocket(io);

    // Initialize Kafka consumer
    const kafkaBrokers = (process.env.KAFKA_BROKERS || 'kafka:9092').split(',');
    initializeKafka(kafkaBrokers).catch((error) => {
        logger.error('Failed to initialize Kafka, continuing without it:', error);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
        logger.info(`${signal} received, shutting down gracefully...`);
        
        await shutdownKafka();
        
        server.close(() => {
            logger.info('HTTP server closed');
            process.exit(0);
        });

        // Force shutdown after 10 seconds
        setTimeout(() => {
            logger.error('Forced shutdown after timeout');
            process.exit(1);
        }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Start the server
    server.listen(port, () => {
        console.log(`Server is running on port ::${port}`);
    });
}