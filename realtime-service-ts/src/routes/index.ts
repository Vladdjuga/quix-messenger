import type {Express} from "express";
import {health} from "./health.js";
import {isUserOnline, getUserLastSeenAt} from "./user.js";
import broadcastRoutes from "./broadcast.js";

export function setupRoutes(app:Express){
    // Health check route
    app.get('/health',health);

    // Broadcast routes for inter-service communication
    app.use('/api/broadcast', broadcastRoutes);

    // Add other routes here
    app.get('/online/:userId', isUserOnline);
    app.get('/user/:userId/presence', getUserLastSeenAt);
}