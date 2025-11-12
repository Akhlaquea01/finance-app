
import Cookies from 'js-cookie';

const storagePrefix = 'finTrac_';

const storage = {
    getToken: () => {
        const tokenData = Cookies.get(`${storagePrefix}token`);
        return tokenData ? JSON.parse(tokenData) : null;
    },
    setToken: (token) => {
        Cookies.set(`${storagePrefix}token`, JSON.stringify({ accessToken: token }), { expires: 7, secure: true, sameSite: 'Strict' });
    },
    clearToken: () => {
        Cookies.remove(`${storagePrefix}token`);
    },

    signOut: () => {
        Cookies.remove(`${storagePrefix}token`);
        Cookies.remove(`${storagePrefix}user`);
        return true;
    },
    setUser: (userData) => {
        Cookies.set(`${storagePrefix}user`, JSON.stringify(userData));
    },
    getUser: () => {
        const userData = Cookies.get(`${storagePrefix}user`);
        return userData ? JSON.parse(userData) : null;
    },
};

export default storage;
