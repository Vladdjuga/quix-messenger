import {setupMiddleware} from "./middleware/index.js";
import {setupRoutes} from "./routes/index.js";
import {Server} from "socket.io";
import {setupSocket} from "./sockets/index.js";

export function startServer(port:number|string){
    const express = require('express');
    const http = require("http");
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