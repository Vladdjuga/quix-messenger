import {type Server} from "socket.io";
import { socketAuthMiddleware } from "../middleware/socket/socketAuthMiddleware.js";
import {socketLoggingMiddleware} from "../middleware/socket/socketLoggingMiddleware.js";
import {socketErrorHandlingMiddleware} from "../middleware/socket/socketErrorHandlingMiddleware.js";
import {registerEvents} from "./events/index.js";

export function setupSocket(io:Server){
    // Set up socket.io middlewares
    io.use(socketLoggingMiddleware)
    io.use(socketErrorHandlingMiddleware)
    io.use(socketAuthMiddleware);

    // Set up socket.io event handlers
    registerEvents(io);
}