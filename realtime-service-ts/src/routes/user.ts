import type {Request, Response} from "express";
import {checkIfUserIsOnline} from "../usecases/redisUseCases.js";

export async function isUserOnline(req: Request, res: Response) {
    // Extract body
    const {userId} = req.params;
    if (!userId) {
        return res.status(400).json({error: 'Missing userId in request body'});
    }
    const isOnline = await checkIfUserIsOnline(userId);
    return res.status(200).json({"isOnline": isOnline});
}