import express, {type Express} from "express";
import {loggingMiddleware} from "./loggingMiddleware.js";
import {authMiddleware} from "./authMiddleware.js";
import cors from "cors";
import {errorHandlingMiddleware} from "./errorHandlingMiddleware.js";

export function setupMiddleware(app:Express){
    const router = express.Router();

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(loggingMiddleware);
    app.use(errorHandlingMiddleware);

    // Router setup
    app.use('/api', router);

    // Apply authentication middleware to all routes under /api
    router.use('/',authMiddleware);
}