
import Cookies from 'js-cookie';

const storagePrefix = 'finTrac_';

const storage = {
    getToken: () => {
        const tokenData = Cookies.get(`${storagePrefix}token`);
        return tokenData ? JSON.parse(tokenData) : null;
    },
    setToken: (tokenData) => {
        // Handle both string and object formats
        const tokenObject = typeof tokenData === 'string' 
            ? { accessToken: tokenData } 
            : tokenData;
        
        // Set the main token cookie
        Cookies.set(`${storagePrefix}token`, JSON.stringify(tokenObject), { 
            expires: 7, 
            sameSite: 'Strict',
            path: '/'
        });
        
        // Also set accessToken cookie for middleware
        if (tokenObject.accessToken) {
            Cookies.set('accessToken', tokenObject.accessToken, { 
                expires: 7, 
                sameSite: 'Strict',
                path: '/'
            });
        }
        
        // Set refreshToken cookie if available
        if (tokenObject.refreshToken) {
            Cookies.set('refreshToken', tokenObject.refreshToken, { 
                expires: 10, 
                sameSite: 'Strict',
                path: '/'
            });
        }
    },
    clearToken: () => {
        Cookies.remove(`${storagePrefix}token`, { path: '/' });
        Cookies.remove('accessToken', { path: '/' });
        Cookies.remove('refreshToken', { path: '/' });
    },

    signOut: () => {
        Cookies.remove(`${storagePrefix}token`, { path: '/' });
        Cookies.remove(`${storagePrefix}user`, { path: '/' });
        Cookies.remove('accessToken', { path: '/' });
        Cookies.remove('refreshToken', { path: '/' });
        return true;
    },
    setUser: (userData) => {
        Cookies.set(`${storagePrefix}user`, JSON.stringify(userData), {
            expires: 7,
            sameSite: 'Strict',
            path: '/'
        });
    },
    getUser: () => {
        const userData = Cookies.get(`${storagePrefix}user`);
        return userData ? JSON.parse(userData) : null;
    },
};

export default storage;
