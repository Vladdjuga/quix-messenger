import type {Request, Response} from "express";
import {checkIfUserIsOnline, getUserLastSeen} from "../usecases/redisUseCases.js";

export async function isUserOnline(req: Request, res: Response) {
    // Extract body
    const {userId} = req.params;
    if (!userId) {
        return res.status(400).json({error: 'Missing userId in request body'});
    }
    const isOnline = await checkIfUserIsOnline(userId);
    return res.status(200).json({"isOnline": isOnline});
}

export async function getUserLastSeenAt(req: Request, res: Response) {
    const {userId} = req.params;
    if (!userId) {
        return res.status(400).json({error: 'Missing userId in request params'});
    }
    
    try {
        const isOnline = await checkIfUserIsOnline(userId);
        let lastSeenAt: string | null = null;
        
        if (!isOnline) {
            lastSeenAt = await getUserLastSeen(userId);
        }
        
        return res.status(200).json({
            isOnline,
            lastSeenAt
        });
    } catch (error) {
        console.error(`Error fetching user presence for ${userId}:`, error);
        return res.status(500).json({error: 'Internal server error'});
    }
}