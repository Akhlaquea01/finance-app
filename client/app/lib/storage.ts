const TOKEN_KEY = 'auth_token';

const storage = {
    getToken: () => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(TOKEN_KEY);
    },

    setToken: (token: string) => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(TOKEN_KEY, token);
    },

    removeToken: () => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(TOKEN_KEY);
    },

    clear: () => {
        if (typeof window === 'undefined') return;
        localStorage.clear();
    }
};

export default storage;