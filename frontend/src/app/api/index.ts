import apiClient from "@/app/api/axios";
import {ReadUserDto} from "@/lib/dto/ReadUserDto";
import { ReadContactDto } from "@/lib/dto/ReadContactDto";

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
    },
    contact:{
        searchByUsernamePaged: (query: string, pageSize: number, lastCreatedAt?: string) =>
            apiClient.get<ReadContactDto[]>(`/contact/search/${encodeURIComponent(query)}`, { params: { pageSize, lastCreatedAt }})
        ,
        requestFriendship: (username: string) =>
            apiClient.post<ReadContactDto>(`/contact/requestFriendship`, { username })
        ,
        acceptFriendship: (contactId: string) =>
            apiClient.post<ReadContactDto>(`/contact/acceptFriendship/${encodeURIComponent(contactId)}`)
    }
}