import Cookies from "js-cookie"
import { axios } from "./axios"
import storage from '@/utils/storage'
import { AxiosResponse } from "axios"

export interface LoginPayload {
    email: string
    password: string
}

export interface SignupPayload {
    fullName: string
    username: string
    email: string
    password: string
    avatar?: File
}

// interface AuthResponse {
//     token: string
//     refreshToken?: string
//     user: {
//         id: string
//         email: string
//         fullName: string
//         username: string
//         avatar?: string
//     }
// }

interface AuthResponse {
    data: {
        accessToken: string
        refreshToken: string
    }
}

class AuthService {
    async login(payload: LoginPayload): Promise<AxiosResponse<AuthResponse>> {
        try {
            const response = await axios.post<AuthResponse>('/users/login', payload)
            const { accessToken, refreshToken } = response.data.data

            if (accessToken) {
                // Store in cookie for persistence
                Cookies.set("token", accessToken, { expires: 7 }) // Expires in 7 days

                // Store in storage for axios interceptor
                storage.setToken({
                    accessToken,
                    refreshToken
                })
            }

            return response
        } catch (error) {
            throw error
        }
    }

    async signup(formData: FormData): Promise<AxiosResponse<AuthResponse>> {
        try {
            const response = await axios.post<AuthResponse>('/users/register', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            return response
        } catch (error) {
            throw error
        }
    }

    logout() {
        // Clear both cookie and storage
        Cookies.remove("token")
        storage.clearToken()
        storage.signOut()
    }

    getToken() {
        return storage.getToken()?.accessToken || Cookies.get("token")
    }

    isAuthenticated() {
        return !!this.getToken()
    }
}

export const authService = new AuthService()