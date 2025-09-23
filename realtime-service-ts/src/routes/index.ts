import type {Express} from "express";
import {health} from "./health.js";
import {isUserOnline, getUserLastSeenAt} from "./user.js";

export function setupRoutes(app:Express){
    // Health check route
    app.get('/health',health);

    // Add other routes here
    app.get('/online/:userId', isUserOnline);
    app.get('/user/:userId/presence', getUserLastSeenAt);
}