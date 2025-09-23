import {api} from "@/app/api";
import type { User } from "@/lib/types";
import { mapReadUserDto } from "@/lib/mappers/userMapper";
type AxiosErrorLike = { response?: { data?: { message?: string } }; message?: string };

export async function getCurrentUserUseCase(): Promise<User> {
    try {
        const response = await api.user.getCurrentUser();
        const data = response.data;
        if (!data) {
            throw new Error('No user data received');
        }
        return mapReadUserDto(data);
    } catch (err) {
        const e = err as AxiosErrorLike;
        const msg = e.response?.data?.message || e.message || "Failed to fetch current user";
        throw new Error(msg);
    }

}