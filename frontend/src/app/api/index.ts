import apiClient from "@/app/api/http";
import {ReadUserDto} from "@/lib/dto/ReadUserDto";
import {ReadFriendshipDto} from "@/lib/dto/ReadFriendshipDto";
import {RegisterUserDto} from "@/lib/dto/RegisterUserDto";
import { ReadMessageDto } from "@/lib/dto/ReadMessageDto";
import { ReadChatWithLastMessageDto } from "@/lib/dto/ReadChatWithLastMessageDto";
import { UpdateUserDto } from "@/lib/dto/UpdateUserDto";

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
        update: (dto: UpdateUserDto) => apiClient.patch<ReadUserDto>('/user/update', dto),
        uploadAvatar: async (file: File) => {
            const form = new FormData();
            form.append('avatar', file, file.name || 'avatar');
            // Upload via BFF, then fetch the updated user to keep return type stable
            await apiClient.post<{ avatarUrl: string }>('/user/avatar', form, {
                headers: { /* Axios will set correct multipart boundary */ },
            });
            return apiClient.get<ReadUserDto>('/user/getCurrentUser');
        },
        searchUsers: (query: string, pageSize: number = 20, lastCreatedAt?: string) => {
            return apiClient.get<ReadUserDto[]>(
                `/user/search`,
                {params: {query: query, pageSize: pageSize, lastCreatedAt: lastCreatedAt}}
            );
        },
    },
    friendship: {
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
    realtime: {
        // Check if a user is online right now via proxy to realtime-service
        isUserOnline: (userId: string, signal?: AbortSignal) =>
            apiClient.get<{ isOnline: boolean }>(`/online/${encodeURIComponent(userId)}`, { signal }),
        // Get user presence info (online status and last seen timestamp)
        getUserPresence: (userId: string, signal?: AbortSignal) =>
            apiClient.get<{ isOnline: boolean; lastSeenAt: string | null }>(`/online/user/${encodeURIComponent(userId)}/presence`, { signal }),
    },
}
