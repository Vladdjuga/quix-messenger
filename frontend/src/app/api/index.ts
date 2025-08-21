import apiClient from "@/app/api/axios";
import {ReadUserDto} from "@/lib/dto/ReadUserDto";
import { ReadContactDto } from "@/lib/dto/ReadContactDto";
import {RegisterUserDto} from "@/lib/dto/RegisterUserDto";

export const api = {
    auth:{
        login : (identity: string, password: string) =>
            apiClient.post('/auth/login', { identity, password }),
        register: (dto : RegisterUserDto) =>
            apiClient.post('/auth/register', dto),
        refreshToken: () =>
            apiClient.post('/auth/refresh'),
        logout: () => apiClient.post('/auth/logout'),
    },
    user:{
        getCurrentUser: () =>
            apiClient.get<ReadUserDto>('/user/getCurrentUser'),
    },
    contact: {
        searchByUsernamePaged: (query: string, pageSize: number, lastCreatedAt?: string) =>
            apiClient.post<ReadContactDto[]>('/contact/search', {
                query,
                pageSize,
                lastCreatedAt,
            }),
        requestFriendship: (username: string) =>
            apiClient.post<ReadContactDto>('/contact/requestFriendship', { username }),

        acceptFriendship: (contactId: string) =>
            apiClient.post<ReadContactDto>('/contact/acceptFriendship', { contactId }),
    }
}