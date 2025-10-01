// redis.ts
import { createClient, type RedisClientType } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

class RedisSingleton {
    private static instance: RedisClientType | null = null;

    private constructor() {}

    public static async getInstance(): Promise<RedisClientType> {
        if (!RedisSingleton.instance) {
            const client:RedisClientType = createClient({ url: REDIS_URL });
            client.on('error', (err) => console.error('Redis Error:', err));

            await client.connect();
            console.log('Redis connected');

            await RedisSingleton.resetOnlineUsersOnStartup(client);

            RedisSingleton.instance = client;
        }
        return RedisSingleton.instance;
    }
    private static async resetOnlineUsersOnStartup(client: RedisClientType) {
        const users = await client.sMembers("online_users_set");
        const now = new Date().toISOString();

        for (const userKey of users) {
            const userId = userKey.replace("user:", "");
            await client.hSet("user_last_seen", `user:${userId}`, now);
        }

        if (users.length > 0) {
            await client.del("online_users_set");
            console.log(`Reset ${users.length} online users at startup`);
        }
    }
}

export default RedisSingleton;