const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export const API_ROUTES = {
    LOGIN: `${API_BASE_URL}/auth/login`,
    SIGNUP: `${API_BASE_URL}/auth/signup`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    PROFILE: `${API_BASE_URL}/users/profile`,
} as const