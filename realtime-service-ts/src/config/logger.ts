import winston from 'winston';
import 'winston-daily-rotate-file';

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    socket: 3,
    http: 4,
    debug: 5,
};

const level = () => {
    const env = 'development'; // Replace with process.env.NODE_ENV or similar in production
    return env === 'development' ? 'debug' : 'warn';
};

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    socket: 'cyan',
    http: 'magenta',
    debug: 'white',
};
winston.addColors(colors);


const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
);

const fileFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
);

const transports = [
    new winston.transports.Console({ format: consoleFormat }),

    // All logs to a file with daily rotation
    new winston.transports.DailyRotateFile({
        filename: 'logs/all-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'info',
        format: fileFormat,
    }),

    // Error logs to a separate file with daily rotation
    new winston.transports.DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'error',
        format: fileFormat,
    }),
];
import { format } from 'winston';
const logger = winston.createLogger({
    level: level(),
    levels,
    format: format.combine(
        format.errors({ stack: true }), // Handle errors with stack traces
        format.splat(), // Enable string interpolation
        format.simple() // Output logs in a simple format
    ),
    transports,
});

export default logger;