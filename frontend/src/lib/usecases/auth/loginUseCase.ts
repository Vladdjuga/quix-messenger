import {LoginUserDto} from "@/lib/dto/LoginUserDto";
import {api} from "@/app/api";

export async function loginUseCase(dto:LoginUserDto) {
    try {
        const response = await api.auth.login(dto.identity, dto.password);
        const data = response.data;

        if (!data.token) {
            throw new Error("Login failed: No token received");
        }
        localStorage.setItem("jwt", data.token);
        return data.token;
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data?.message || "Login failed");
        }
        throw new Error(error.message || "Network error");
    }
}