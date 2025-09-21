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
}