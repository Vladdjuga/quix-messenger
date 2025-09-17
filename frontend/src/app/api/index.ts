import apiClient from "@/app/api/http";
import {ReadUserDto} from "@/lib/dto/ReadUserDto";
import {ReadFriendshipDto} from "@/lib/dto/ReadFriendshipDto";
import {RegisterUserDto} from "@/lib/dto/RegisterUserDto";
import { ReadMessageDto } from "@/lib/dto/ReadMessageDto";
import { ReadChatWithLastMessageDto } from "@/lib/dto/ReadChatWithLastMessageDto";

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
    friendship: {
        searchFriendships: (query: string, pageSize: number, lastCreatedAt?: string) => {
            return apiClient.get<ReadFriendshipDto[]>(
                `/friendship/searchFriendships`,
                {params: {query: query, pageSize: pageSize, lastCreatedAt: lastCreatedAt}}
            );
        },
        requestFriendship: (username: string) =>
            apiClient.post<ReadFriendshipDto>('/friendship/requestFriendship', {username}),

        acceptFriendship: (friendshipId: string) =>
            apiClient.post<ReadFriendshipDto>('/friendship/acceptFriendship', {friendshipId}),

        cancelFriendRequest: (friendshipId: string) =>
            apiClient.delete(`/friendship/cancelFriendRequest/${friendshipId}`),

        rejectFriendRequest: (friendshipId: string) =>
            apiClient.delete(`/friendship/rejectFriendRequest/${friendshipId}`),

        getFriendRequests: (query: string, pageSize: number, lastCreatedAt?: string) => {
            return apiClient.get<ReadFriendshipDto[]>(
                `/friendship/getFriendRequests`,
                {params: {query: query, pageSize: pageSize, lastCreatedAt: lastCreatedAt}}
            );
        },

        getSentRequests: (query: string, pageSize: number, lastCreatedAt?: string) => {
            return apiClient.get<ReadFriendshipDto[]>(
                `/friendship/getSentRequests`,
                {params: {query: query, pageSize: pageSize, lastCreatedAt: lastCreatedAt}}
            );
        },

        // Get existing friends (active friendships)
        getFriendships: (pageSize: number = 20, lastCreatedAt?: string) => {
            return apiClient.get<ReadFriendshipDto[]>(
                `/friendship/getFriendships`,
                {params: {pageSize: pageSize, lastCreatedAt: lastCreatedAt}}
            );
        },

        // Get friendship relationship by friendship ID
        getFriendship: (friendshipId: string) => {
            return apiClient.get<ReadFriendshipDto>(`/friendship/getFriendship/${friendshipId}`);
        },
    },
    chats: {
        // Next API routes proxy to user-service. This returns chats for the current user.
        list: () => apiClient.get<ReadChatWithLastMessageDto[]>(`/chats`),
    },
    messages: {
        // Get last N messages by chat id
        last: (chatId: string, count: number = 50) =>
            apiClient.get<ReadMessageDto[]>(`/messages/last`, { params: { chatId, count } }),
        // Get paginated messages by chat id using lastCreatedAt cursor
        paginated: (chatId: string, lastCreatedAt: string, pageSize: number = 50) =>
            apiClient.get<ReadMessageDto[]>(`/messages/paginated`, { params: { chatId, lastCreatedAt, pageSize } }),
    },
}
