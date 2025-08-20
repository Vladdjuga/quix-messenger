import {api} from "@/app/api";
import {ReadUserDto} from "@/lib/dto/ReadUserDto";

export async function getCurrentUserUseCase() {
    try {
        const response = await api.user.getCurrentUser();
        const data = response.data;
        if (!data) {
            throw new Error('No user data received');
        }
        return data; // Return the user data for further use
    } catch (err: any) {
        const msg = err.response?.data?.message || err.message || "Failed to fetch current user";
        throw new Error(msg);
    }

}