import apiClient from "@/app/api/axios";
import {ReadUserDto} from "@/lib/dto/ReadUserDto";

export const api = {
    auth:{
        login : (identity: string, password: string) =>
            apiClient.post('/auth/login', { identity, password }),
        register: (username: string, email: string, password: string) =>
            apiClient.post('/auth/register', { username, email, password }),
        refreshToken: () =>
            apiClient.post('/auth/refresh'),
        logout: () => apiClient.post('/auth/logout'),
    },
    user:{
        getCurrentUser: () =>
            apiClient.get<ReadUserDto>('/user/getCurrentUser'),
    }
}