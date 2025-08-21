import {api} from "@/app/api";
import {ReadUserDto} from "@/lib/dto/ReadUserDto";
type AxiosErrorLike = { response?: { data?: { message?: string } }; message?: string };

export async function getCurrentUserUseCase(): Promise<ReadUserDto> {
    try {
        const response = await api.user.getCurrentUser();
        const data = response.data;
        if (!data) {
            throw new Error('No user data received');
        }
        return data; // Return the user data for further use
    } catch (err) {
        const e = err as AxiosErrorLike;
        const msg = e.response?.data?.message || e.message || "Failed to fetch current user";
        throw new Error(msg);
    }

}