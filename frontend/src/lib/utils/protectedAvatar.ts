import {getToken} from '@/app/api/token';

// TTL for cache entries (5 minutes)
const CACHE_TTL = 5 * 60_000;

type CacheEntry = {
    url: string | null;
    timestamp: number;
};

type GlobalCacheType = {
    blobCache: Map<string, CacheEntry>;
    inflightRequests: Map<string, Promise<string | null>>;
};

// Global singleton cache to persist across hot module reloads
const globalCache = ((globalThis as unknown) as Record<string, GlobalCacheType>).__BLOB_CACHE__ ?? {
    blobCache: new Map<string, CacheEntry>(),
    inflightRequests: new Map<string, Promise<string | null>>(),
};

((globalThis as unknown) as Record<string, GlobalCacheType>).__BLOB_CACHE__ = globalCache;

export const blobCache = globalCache.blobCache;
export const inflightRequests = globalCache.inflightRequests;

/**
 * Logging utility for development
 */
function log(...args: unknown[]) {
    if (process.env.NODE_ENV === 'development') {
        console.log('[Blob Cache]', ...args);
    }
}

/**
 * Cache null value helper
 */
function cacheNull(key: string): null {
    blobCache.set(key, {url: null, timestamp: Date.now()});
    return null;
}

/**
 * Revoke a cached blob URL and remove it from cache
 */
export function revokeBlobUrl(key: string) {
    const entry = blobCache.get(key);
    if (entry?.url) {
        URL.revokeObjectURL(entry.url);
    }
    blobCache.delete(key);
    inflightRequests.delete(key);
}

/**
 * Clear all cached blob URLs
 */
export function clearBlobCache() {
    blobCache.forEach((entry: CacheEntry) => {
        if (entry.url) URL.revokeObjectURL(entry.url);
    });
    blobCache.clear();
    inflightRequests.clear();
}

/**
 * Universal utility to fetch and create a blob URL for protected resources
 */
async function getProtectedBlobUrl(
    type: 'user' | 'chat' | 'attachment',
    id: string,
    endpoint: string,
): Promise<string | null> {
    const cacheKey = `${type}:${id}`;

    // Check cache with TTL
    const cachedEntry = blobCache.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
        log('HIT', cacheKey);
        return cachedEntry.url;
    }

    // Remove stale entry if exists
    if (cachedEntry) {
        if (cachedEntry.url) URL.revokeObjectURL(cachedEntry.url);
        blobCache.delete(cacheKey);
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
            const url = URL.createObjectURL(blob);

            blobCache.set(cacheKey, {url, timestamp: Date.now()});
            log('STORED', cacheKey, `- total cached: ${blobCache.size}`);

            return url;
        } catch (err) {
            console.error(`[Blob Cache] ERROR fetching ${cacheKey}`, err);
            return cacheNull(cacheKey);
        } finally {
            inflightRequests.delete(cacheKey);
        }
    })();

    inflightRequests.set(cacheKey, fetchPromise);
    return fetchPromise;
}

/**
 * Fetch protected user avatar
 */
export const getProtectedUserAvatarUrl = (userId: string) =>
    getProtectedBlobUrl('user', userId, `/api/user/avatar/get/${encodeURIComponent(userId)}`);

/**
 * Fetch protected chat avatar
 */
export const getProtectedChatAvatarUrl = (chatId: string) =>
    getProtectedBlobUrl('chat', chatId, `/api/chats/getChatAvatar/${encodeURIComponent(chatId)}`);

/**
 * Fetch protected attachment
 */
export const getProtectedAttachmentBlobUrl = (attachmentId: string) =>
    getProtectedBlobUrl('attachment', attachmentId, `/api/attachments/download/${encodeURIComponent(attachmentId)}`);
