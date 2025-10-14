import {getToken} from '@/app/api/token';

// TTL for cache entries (5 minutes)
const CACHE_TTL = 5 * 60_000;

type CacheEntry = {
    dataUrl: string | null;
    timestamp: number;
};

type GlobalCacheType = {
    dataUrlCache: Map<string, CacheEntry>;
    inflightRequests: Map<string, Promise<string | null>>;
};

// Global singleton cache to persist across hot module reloads
const globalCache = ((globalThis as unknown) as Record<string, GlobalCacheType>).__DATA_URL_CACHE__ ?? {
    dataUrlCache: new Map<string, CacheEntry>(),
    inflightRequests: new Map<string, Promise<string | null>>(),
};

((globalThis as unknown) as Record<string, GlobalCacheType>).__DATA_URL_CACHE__ = globalCache;

export const dataUrlCache = globalCache.dataUrlCache;
export const inflightRequests = globalCache.inflightRequests;

/**
 * Logging utility for development
 */
function log(...args: unknown[]) {
    if (process.env.NODE_ENV === 'development') {
        console.log('[Data URL Cache]', ...args);
    }
}

/**
 * Cache null value helper
 */
function cacheNull(key: string): null {
    dataUrlCache.set(key, {dataUrl: null, timestamp: Date.now()});
    return null;
}

/**
 * Remove a cached data URL from cache
 */
export function removeDataUrl(key: string) {
    dataUrlCache.delete(key);
    inflightRequests.delete(key);
}

/**
 * Clear all cached data URLs
 */
export function clearDataUrlCache() {
    dataUrlCache.clear();
    inflightRequests.clear();
}

/**
 * Universal utility to fetch and create a data URL for protected resources
 */
async function getProtectedDataUrl(
    type: 'user' | 'chat' | 'attachment',
    id: string,
    endpoint: string,
): Promise<string | null> {
    const cacheKey = `${type}:${id}`;

    // Check cache with TTL
    const cachedEntry = dataUrlCache.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
        log('HIT', cacheKey);
        return cachedEntry.dataUrl;
    }

    // Remove stale entry if exists
    if (cachedEntry) {
        dataUrlCache.delete(cacheKey);
    }

    // Check for in-flight request
    if (inflightRequests.has(cacheKey)) {
        log('WAITING for in-flight request', cacheKey);
        return inflightRequests.get(cacheKey)!;
    }

    log('MISS', cacheKey, '- fetching...');

    const fetchPromise = (async () => {
        try {
            const token = getToken();
            if (!token) return cacheNull(cacheKey);

            const res = await fetch(endpoint, {
                headers: {Authorization: `Bearer ${token}`},
            });

            if (res.status === 204 || !res.ok) return cacheNull(cacheKey);

            const blob = await res.blob();
            
            // Convert blob to data URL
            const dataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });

            dataUrlCache.set(cacheKey, {dataUrl, timestamp: Date.now()});
            log('STORED', cacheKey, `- total cached: ${dataUrlCache.size}`);

            return dataUrl;
        } catch (err) {
            console.error(`[Data URL Cache] ERROR fetching ${cacheKey}`, err);
            return cacheNull(cacheKey);
        } finally {
            inflightRequests.delete(cacheKey);
        }
    })();

    inflightRequests.set(cacheKey, fetchPromise);
    return fetchPromise;
}

/**
 * Fetch protected user avatar as data URL
 */
export const getProtectedUserAvatarUrl = (userId: string) =>
    getProtectedDataUrl('user', userId, `/api/user/avatar/get/${encodeURIComponent(userId)}`);

/**
 * Fetch protected chat avatar as data URL
 */
export const getProtectedChatAvatarUrl = (chatId: string) =>
    getProtectedDataUrl('chat', chatId, `/api/chats/getChatAvatar/${encodeURIComponent(chatId)}`);

/**
 * Fetch protected attachment as data URL
 */
export const getProtectedAttachmentBlobUrl = (attachmentId: string) =>
    getProtectedDataUrl('attachment', attachmentId, `/api/attachments/download/${encodeURIComponent(attachmentId)}`);
