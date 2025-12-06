/**
 * Cache utility using Session Storage instead of Cookies
 * This prevents cache data from being sent with every HTTP request
 * and keeps it only for the current browser session
 */

interface CacheData {
    data: any;
    timestamp: number;
}

const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

export const cache = {
    set: (key: string, data: any) => {
        if (typeof window === 'undefined') return; // SSR safety

        try {
            const cacheData: CacheData = {
                data,
                timestamp: Date.now(),
            };
            sessionStorage.setItem(key, JSON.stringify(cacheData));
        } catch (error) {
            console.error('Error setting cache:', error);
            // If storage is full, try to clear old entries
            try {
                // Clear expired entries first
                const keys = Object.keys(sessionStorage);
                keys.forEach(storageKey => {
                    try {
                        const item = sessionStorage.getItem(storageKey);
                        if (item) {
                            const parsed = JSON.parse(item);
                            if (parsed.timestamp && Date.now() - parsed.timestamp > CACHE_EXPIRY) {
                                sessionStorage.removeItem(storageKey);
                            }
                        }
                    } catch {
                        // Ignore parsing errors for non-cache items
                    }
                });
                // Try again
                sessionStorage.setItem(key, JSON.stringify({
                    data,
                    timestamp: Date.now(),
                }));
            } catch (clearError) {
                console.error('Error clearing session storage:', clearError);
            }
        }
    },

    get: (key: string) => {
        if (typeof window === 'undefined') return null; // SSR safety

        try {
            const cachedData = sessionStorage.getItem(key);
            if (!cachedData) return null;

            const { data, timestamp }: CacheData = JSON.parse(cachedData);
            const isExpired = Date.now() - timestamp > CACHE_EXPIRY;

            if (isExpired) {
                sessionStorage.removeItem(key);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error parsing cached data:', error);
            return null;
        }
    },

    remove: (key: string) => {
        if (typeof window === 'undefined') return; // SSR safety
        try {
            sessionStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing cache:', error);
        }
    },

    clear: () => {
        if (typeof window === 'undefined') return; // SSR safety
        try {
            // Only clear cache keys, not other session storage items
            const keys = Object.keys(sessionStorage);
            keys.forEach(key => {
                // Only remove items that look like cache entries (have timestamp)
                try {
                    const item = sessionStorage.getItem(key);
                    if (item) {
                        const parsed = JSON.parse(item);
                        if (parsed.timestamp) {
                            sessionStorage.removeItem(key);
                        }
                    }
                } catch {
                    // Ignore non-JSON items
                }
            });
        } catch (error) {
            console.error('Error clearing cache:', error);
        }
    }
};