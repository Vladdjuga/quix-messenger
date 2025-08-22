import { api } from "@/app/api";
import { ReadUserDto } from "@/lib/dto/ReadUserDto";

type AxiosErrorLike = { response?: { data?: { message?: string } }; message?: string };

export async function searchUsersUseCase(
    query: string, 
    pageSize: number = 20, 
    lastCreatedAt?: string
): Promise<ReadUserDto[]> {
    try {
        if (!query.trim()) {
            throw new Error("Search query cannot be empty");
        }

        const response = await api.user.searchUsers(query.trim(), pageSize, lastCreatedAt);
        
        if (!response.data) {
            return [];
        }
        
        return response.data;
    } catch (error) {
        const e = error as AxiosErrorLike;
        const msg = e.response?.data?.message || e.message || "Failed to search users";
        throw new Error(msg);
    }
}
