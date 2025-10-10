import apiClient from "@/app/api/http";
import {ReadUserDto} from "@/lib/dto/user/ReadUserDto";
import {ReadFriendshipDto} from "@/lib/dto/friendship/ReadFriendshipDto";
import {RegisterUserDto} from "@/lib/dto/user/RegisterUserDto";
import { ReadMessageDto } from "@/lib/dto/message/ReadMessageDto";
import { MessageAttachmentDto } from "@/lib/dto/message/MessageAttachmentDto";
import { ReadChatDto } from "@/lib/dto/chat/ReadChatDto";
import { UpdateUserDto } from "@/lib/dto/user/UpdateUserDto";
import {mapReadChatWithLastMessageDto, mapReadChatWithLastMessageDtos} from "@/lib/mappers/chatMapper";
import { ChatWithLastMessage } from "@/lib/types";
import {CreateChatDto} from "@/lib/dto/chat/CreateChatDto";
import {AddUserToChatDto} from "@/lib/dto/chat/AddUserToChatDto";
import { UpdateChatDto, RemoveUserFromChatDto, ChatParticipantDto } from "@/lib/dto/chat/ChatManagementDto";

export const api = {
    auth: {
        login: (identity: string, password: string) =>
            apiClient.post('/auth/login', {identity, password}),
        register: (dto: RegisterUserDto) =>
            apiClient.post('/auth/register', dto),
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

        // Search friendships with query
        searchFriendships: (query: string, pageSize: number = 20, lastCreatedAt?: string) => {
            return apiClient.get<ReadFriendshipDto[]>(
                `/friendship/searchFriendships`,
                {params: {query: query, pageSize: pageSize, lastCreatedAt: lastCreatedAt}}
            );
        },
    },
    chats: {
        // Next API routes proxy to user-service. Returns domain chats for the current user.
        list: async (): Promise<ChatWithLastMessage[]> => {
            const resp = await apiClient.get<ReadChatDto[]>(`/chats`);
            return mapReadChatWithLastMessageDtos(resp.data);
        },
        add: async (dto: CreateChatDto) => {
            const resp = await apiClient.post<ReadChatDto>(`/chats`, dto);
            return mapReadChatWithLastMessageDto(resp.data);
        },
        addUser: async (dto: AddUserToChatDto) => {
            const resp = await apiClient.post(`/chats/addUserToChat`, dto);
            return resp.data;
        },
        update: async (dto: UpdateChatDto) => {
            const resp = await apiClient.patch(`/chats/updateChat`, dto);
            return resp.data;
        },
        removeUser: async (dto: RemoveUserFromChatDto) => {
            const resp = await apiClient.post(`/chats/removeUserFromChat`, dto);
            return resp.data;
        },
        getParticipants: async (chatId: string): Promise<ChatParticipantDto[]> => {
            const resp = await apiClient.get<ChatParticipantDto[]>(`/chats/getChatParticipants?chatId=${chatId}`);
            return resp.data;
        },
        uploadAvatar: async (chatId: string, file: File) => {
            const form = new FormData();
            form.append('avatar', file, file.name || 'avatar');
            form.append('chatId', chatId);
            return apiClient.post<{ avatarUrl: string }>('/chats/uploadChatAvatar', form, {
                headers: { /* Axios will set correct multipart boundary */ },
            });
        }
    },
    messages: {
        // Create a new message with optional attachments
        create: async (text: string, chatId: string, attachments?: File[]): Promise<ReadMessageDto> => {
            const form = new FormData();
            form.append('text', text);
            form.append('chatId', chatId);
            
            if (attachments && attachments.length > 0) {
                attachments.forEach((file) => form.append('attachments', file));
            }
            
            const response = await apiClient.post<ReadMessageDto>('/messages', form, {
                headers: { /* Axios will set correct multipart boundary */ },
            });
            return response.data;
        },
        // Get last N messages by chat id
        last: (chatId: string, count: number = 50) =>
            apiClient.get<ReadMessageDto[]>(`/messages/last`, { params: { chatId, count } }),
        // Get paginated messages by chat id using lastCreatedAt cursor
        paginated: (chatId: string, lastCreatedAt: Date, pageSize: number = 50) =>
            apiClient.get<ReadMessageDto[]>(`/messages/paginated`, { params: { chatId, lastCreatedAt, pageSize } }),
        // Delete a message by id
        delete: (messageId: string) => apiClient.delete<void>(`/messages/${encodeURIComponent(messageId)}`),
    },
    attachments: {
        upload: async (messageId: string, chatId: string, files: File[]): Promise<MessageAttachmentDto[]> => {
            const form = new FormData();
            files.forEach((file) => form.append('files', file));
            form.append('messageId', messageId);
            form.append('chatId', chatId);
            
            const response = await apiClient.post<MessageAttachmentDto[]>(
                '/attachments/upload', 
                form,
                {
                    headers: { /* Axios will set correct multipart boundary */ },
                }
            );
            return response.data;
        },
        getByMessage: async (messageId: string): Promise<MessageAttachmentDto[]> => {
            const response = await apiClient.get<MessageAttachmentDto[]>(
                `/attachments/message/${encodeURIComponent(messageId)}`
            );
            return response.data;
        },
        download: async (attachmentId: string): Promise<Blob> => {
            const response = await apiClient.get(
                `/attachments/download/${encodeURIComponent(attachmentId)}`,
                {
                    responseType: 'blob', // Important for binary data
                }
            );
            return response.data;
        },
        getDownloadUrl: (attachmentId: string): string => {
            // Assuming apiClient has a baseURL configured
            return `/api/attachments/download/${encodeURIComponent(attachmentId)}`;
        },
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
