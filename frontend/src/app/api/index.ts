import apiClient from "@/app/api/axios";
import {ReadUserDto} from "@/lib/dto/ReadUserDto";
import {ReadContactDto} from "@/lib/dto/ReadContactDto";
import {RegisterUserDto} from "@/lib/dto/RegisterUserDto";

export const api = {
    auth: {
        login: (identity: string, password: string) =>
            apiClient.post('/auth/login', {identity, password}),
        register: (dto: RegisterUserDto) =>
            apiClient.post('/auth/register', dto),
        refreshToken: () =>
            apiClient.post('/auth/refresh'),
        logout: () => apiClient.post('/auth/logout'),
    },
    user: {
        getCurrentUser: () =>
            apiClient.get<ReadUserDto>('/user/getCurrentUser'),
        searchUsers: (query: string, pageSize: number = 20, lastCreatedAt?: string) => {
            return apiClient.get<ReadUserDto[]>(
                `/user/search`,
                {params: {query: query, pageSize: pageSize, lastCreatedAt: lastCreatedAt}}
            );
        },
    },
    contact: {
        searchByUsernamePaged: (query: string, pageSize: number, lastCreatedAt?: string) => {
            return apiClient.get<ReadContactDto[]>(
                `/contact/search`,
                {params: {query: query, pageSize: pageSize, lastCreatedAt: lastCreatedAt}}
            );
        },
        requestFriendship: (username: string) =>
            apiClient.post<ReadContactDto>('/contact/requestFriendship', {username}),

        acceptFriendship: (contactId: string) =>
            apiClient.post<ReadContactDto>('/contact/acceptFriendship', {contactId}),

        getFriendRequests: (query: string, pageSize: number, lastCreatedAt?: string) => {
            return apiClient.get<ReadContactDto[]>(
                `/contact/getFriendRequests`,
                {params: {query: query, pageSize: pageSize, lastCreatedAt: lastCreatedAt}}
            );
        },

        // Get existing friends (active contacts)
        getContacts: (pageSize: number = 20, lastCreatedAt?: string) => {
            return apiClient.get<ReadContactDto[]>(
                `/contact/getContacts`,
                {params: {pageSize: pageSize, lastCreatedAt: lastCreatedAt}}
            );
        },

        // Search through existing friends
        searchContacts: (query: string, pageSize: number = 20, lastCreatedAt?: string) => {
            return apiClient.get<ReadContactDto[]>(
                `/contact/searchContacts`,
                {params: {query: query, pageSize: pageSize, lastCreatedAt: lastCreatedAt}}
            );
        },

        // Get contact relationship by contact user ID
        getContact: (contactId: string) => {
            return apiClient.get<ReadContactDto>(`/contact/getContact/${contactId}`);
        },
    }
}