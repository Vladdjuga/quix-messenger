import {setupMiddleware} from "./middleware/index.js";
import {setupRoutes} from "./routes/index.js";
import {setupSocket} from "./sockets/index.js";
import express from "express";
import * as http from "node:http";
import {initIO} from "./io.js";

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

    // Start the server
    server.listen(port, () => {
        console.log(`Server is running on port ::${port}`);
    });
}