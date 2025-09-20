// redis.ts
import { createClient, type RedisClientType } from 'redis';

class RedisSingleton {
    private static instance: RedisClientType | null = null;

    private constructor() {}

    public static getInstance(): RedisClientType {
        if (!RedisSingleton.instance) {
            RedisSingleton.instance = createClient();
            RedisSingleton.instance.on('error', (err) => console.error('Redis Error:', err));
            RedisSingleton.instance.connect()
                .then(() => console.log('Redis connected'))
                .catch(console.error);
        }
        return RedisSingleton.instance;
    }
}

export default RedisSingleton;