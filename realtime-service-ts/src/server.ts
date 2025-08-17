import {setupMiddleware} from "./middleware/index.js";
import {setupRoutes} from "./routes/index.js";
import {Server} from "socket.io";
import {setupSocket} from "./sockets/index.js";
import express from "express";
import * as http from "node:http";

export function startServer(port:number|string){
    const app = express();
    const server = http.createServer(app);

    const io = new Server(server);

    // Middleware
    setupMiddleware(app);

    // Routes
    setupRoutes(app);

    //Socket.IO setup
    setupSocket(io);

    // Start the server
    server.listen(port, () => {
        console.log(`Server is running on port ::${port}`);
    });
}