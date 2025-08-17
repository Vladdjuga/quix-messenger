import type {Express} from "express";
import {health} from "./health.js";

export function setupRoutes(app:Express){
    // Health check route
    app.get('/health',health);

    // Add other routes here
}