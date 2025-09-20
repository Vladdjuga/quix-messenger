// redis.ts
import { createClient, type RedisClientType } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

class RedisSingleton {
    private static instance: RedisClientType | null = null;

    private constructor() {}

    public static getInstance(): RedisClientType {
        if (!RedisSingleton.instance) {
            RedisSingleton.instance = createClient({
                url: REDIS_URL // default is localhost:6379
            });
            RedisSingleton.instance.on('error', (err) => console.error('Redis Error:', err));
            RedisSingleton.instance.connect()
                .then(() => console.log('Redis connected'))
                .catch(console.error);
        }
        return RedisSingleton.instance;
    }
}

export default RedisSingleton;