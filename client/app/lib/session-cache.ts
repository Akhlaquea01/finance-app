/**
 * Session Storage Cache Utility
 * Used for caching expensive API calls (like AI suggestions) in session storage
 * Data persists only for the current browser session
 */

interface SessionCacheData {
    data: any;
    timestamp: number;
    expiry?: number; // Optional custom expiry in milliseconds
}

const DEFAULT_EXPIRY = 30 * 60 * 1000; // 30 minutes default expiry

/**
 * Helper function to remove expired cache entries from session storage
 * Only removes cache entries (items with timestamp and expiry), not all session storage
 */
const removeExpiredCacheEntries = (): number => {
    if (typeof window === 'undefined') return 0; // SSR safety
    
    let removedCount = 0;
    try {
        const keys = Object.keys(sessionStorage);
        keys.forEach(storageKey => {
            try {
                const item = sessionStorage.getItem(storageKey);
                if (item) {
                    const parsed = JSON.parse(item);
                    // Only remove items that are cache entries (have timestamp and expiry)
                    if (parsed.timestamp && parsed.expiry !== undefined) {
                        const isExpired = Date.now() - parsed.timestamp > parsed.expiry;
                        if (isExpired) {
                            sessionStorage.removeItem(storageKey);
                            removedCount++;
                        }
                    }
                }
            } catch {
                // Ignore parsing errors for non-cache items
            }
        });
    } catch (error) {
        console.error('Error removing expired cache entries:', error);
    }
    return removedCount;
};

/**
 * Helper function to remove all cache entries (not just expired ones)
 * Only removes cache entries (items with timestamp and expiry), not all session storage
 */
const removeAllCacheEntries = (): number => {
    if (typeof window === 'undefined') return 0; // SSR safety
    
    let removedCount = 0;
    try {
        const keys = Object.keys(sessionStorage);
        keys.forEach(storageKey => {
            try {
                const item = sessionStorage.getItem(storageKey);
                if (item) {
                    const parsed = JSON.parse(item);
                    // Only remove items that are cache entries (have timestamp and expiry)
                    if (parsed.timestamp && parsed.expiry !== undefined) {
                        sessionStorage.removeItem(storageKey);
                        removedCount++;
                    }
                }
            } catch {
                // Ignore parsing errors for non-cache items
            }
        });
    } catch (error) {
        console.error('Error removing cache entries:', error);
    }
    return removedCount;
};

export const sessionCache = {
    /**
     * Store data in session storage with timestamp
     * @param key - Cache key
     * @param data - Data to cache
     * @param expiry - Optional custom expiry in milliseconds (default: 30 minutes)
     */
    set: (key: string, data: any, expiry?: number) => {
        if (typeof window === 'undefined') return; // SSR safety

        try {
            const cacheData: SessionCacheData = {
                data,
                timestamp: Date.now(),
                expiry: expiry || DEFAULT_EXPIRY,
            };
            sessionStorage.setItem(key, JSON.stringify(cacheData));
        } catch (error) {
            console.error('Error setting session cache:', error);
            // If storage is full, try to clear expired cache entries first
            try {
                const removedExpired = removeExpiredCacheEntries();
                if (removedExpired > 0) {
                    console.log(`Removed ${removedExpired} expired cache entries, retrying...`);
                }
                
                // Try to set the item again after removing expired entries
                try {
                    sessionStorage.setItem(key, JSON.stringify({
                        data,
                        timestamp: Date.now(),
                        expiry: expiry || DEFAULT_EXPIRY,
                    }));
                    return; // Success after removing expired entries
                } catch (retryError) {
                    // If still failing, try removing all cache entries (but not all session storage)
                    console.warn('Still unable to set cache after removing expired entries, removing all cache entries...');
                    const removedAll = removeAllCacheEntries();
                    if (removedAll > 0) {
                        console.log(`Removed ${removedAll} cache entries, retrying...`);
                    }
                    
                    // Final attempt
                    sessionStorage.setItem(key, JSON.stringify({
                        data,
                        timestamp: Date.now(),
                        expiry: expiry || DEFAULT_EXPIRY,
                    }));
                }
            } catch (clearError) {
                console.error('Error clearing cache entries:', clearError);
                // Last resort: only clear all session storage if absolutely necessary
                // This should rarely happen, but we log it as a warning
                console.warn('All cleanup attempts failed. Session storage may be completely full.');
            }
        }
    },

    /**
     * Get data from session storage if not expired
     * @param key - Cache key
     * @returns Cached data or null if not found/expired
     */
    get: (key: string): any => {
        if (typeof window === 'undefined') return null; // SSR safety

        try {
            const cachedData = sessionStorage.getItem(key);
            if (!cachedData) return null;

            const { data, timestamp, expiry = DEFAULT_EXPIRY }: SessionCacheData = JSON.parse(cachedData);
            const isExpired = Date.now() - timestamp > expiry;

            if (isExpired) {
                sessionStorage.removeItem(key);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error getting session cache:', error);
            return null;
        }
    },

    /**
     * Remove a specific key from session storage
     * @param key - Cache key to remove
     */
    remove: (key: string) => {
        if (typeof window === 'undefined') return; // SSR safety
        try {
            sessionStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing session cache:', error);
        }
    },

    /**
     * Clear all session cache entries (only cache keys, not all session storage)
     */
    clear: () => {
        if (typeof window === 'undefined') return; // SSR safety
        const removedCount = removeAllCacheEntries();
        if (removedCount > 0) {
            console.log(`Cleared ${removedCount} cache entries from session storage`);
        }
    },

    /**
     * Check if a key exists and is not expired
     * @param key - Cache key to check
     * @returns true if key exists and is valid
     */
    has: (key: string): boolean => {
        if (typeof window === 'undefined') return false; // SSR safety
        
        try {
            const cachedData = sessionStorage.getItem(key);
            if (!cachedData) return false;

            const { timestamp, expiry = DEFAULT_EXPIRY }: SessionCacheData = JSON.parse(cachedData);
            const isExpired = Date.now() - timestamp > expiry;

            if (isExpired) {
                sessionStorage.removeItem(key);
                return false;
            }

            return true;
        } catch (error) {
            return false;
        }
    },
};

