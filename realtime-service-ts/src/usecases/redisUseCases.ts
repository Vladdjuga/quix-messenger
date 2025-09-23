import RedisSingleton from "../redis.js";
import logger from "../config/logger.js";

const redis = RedisSingleton.getInstance();

export async function checkIfUserIsOnline(userId: string): Promise<boolean> {
    logger.info(`Checking if user ${userId} has online status`);
    return await redis.sIsMember('online_users_set', `user:${userId}`)===1;
}

export async function addUserToOnlineSet(userId: string): Promise<void> {
    logger.info(`Marking user ${userId} as online`);
    await redis.sAdd('online_users_set', `user:${userId}`);
}

export async function removeUserFromOnlineSet(userId: string): Promise<void> {
    logger.info(`Removing user ${userId} from online status`);
    await redis.sRem('online_users_set', `user:${userId}`);
    // Set last seen timestamp when user goes offline
    await setUserLastSeen(userId);
}

export async function setUserLastSeen(userId: string): Promise<void> {
    const timestamp = new Date().toISOString();
    logger.info(`Setting last seen for user ${userId} to ${timestamp}`);
    await redis.hSet('user_last_seen', `user:${userId}`, timestamp);
}

export async function getUserLastSeen(userId: string): Promise<string | null> {
    logger.info(`Getting last seen for user ${userId}`);
    const lastSeen = await redis.hGet('user_last_seen', `user:${userId}`);
    return lastSeen || null;
}