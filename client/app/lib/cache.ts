import Cookies from 'js-cookie';

interface CacheData {
    data: any;
    timestamp: number;
}

const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

export const cache = {
    set: (key: string, data: any) => {
        const cacheData: CacheData = {
            data,
            timestamp: Date.now(),
        };
        Cookies.set(key, JSON.stringify(cacheData), { expires: 1 }); // Expires in 1 day
    },

    get: (key: string) => {
        const cachedData = Cookies.get(key);
        if (!cachedData) return null;

        try {
            const { data, timestamp }: CacheData = JSON.parse(cachedData);
            const isExpired = Date.now() - timestamp > CACHE_EXPIRY;

            if (isExpired) {
                Cookies.remove(key);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error parsing cached data:', error);
            return null;
        }
    },

    remove: (key: string) => {
        Cookies.remove(key);
    },

    clear: () => {
        Object.keys(Cookies.get()).forEach(key => {
            Cookies.remove(key);
        });
    }
};