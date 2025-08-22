import {LoginUserDto} from "@/lib/dto/LoginUserDto";
import {api} from "@/app/api";

type AxiosErrorLike = { response?: { data?: { message?: string } }; message?: string };

export async function loginUseCase(dto:LoginUserDto): Promise<string> {
    try {
        const response = await api.auth.login(dto.identity, dto.password);
        const data = response.data;

        if (!data.accessToken) {
            throw new Error("Login failed: No token received");
        }
        localStorage.setItem("jwt", data.accessToken);
        
        return data.accessToken;
    } catch (error) {
        const e = error as AxiosErrorLike;
        if (e.response) {
            throw new Error(e.response.data?.message || "Login failed");
        }
        throw new Error(e.message || "Network error");
    }
}