import {LoginUserDto} from "@/lib/dto/LoginUserDto";
import {api} from "@/app/api";
import apiClient from "@/app/api/http";

type AxiosErrorLike = { response?: { data?: { message?: string } }; message?: string };

export async function loginUseCase(dto:LoginUserDto): Promise<string> {
    try {
        const response = await api.auth.login(dto.identity, dto.password);
        const data = response.data as { accessToken?: string } | string;
        const maybeToken = typeof data === 'string' ? data : data.accessToken;
        if (!maybeToken) throw new Error("Login failed: No token received");
        
        // Normalize then validate JWT format before storing
    let token: string = String(maybeToken ?? '').trim();
        if (token.startsWith('"') && token.endsWith('"')) token = token.slice(1, -1);
        if (token.toLowerCase().startsWith('bearer ')) token = token.slice(7).trim();
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
            console.error('Invalid JWT format received from login - expected 3 parts, got:', tokenParts.length);
            console.error('Token:', JSON.stringify(token));
            throw new Error("Login failed: Invalid token format received");
        }

    localStorage.setItem("jwt", token);
    // Also set default header immediately so subsequent requests include it
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        return token;
    } catch (error) {
        const e = error as AxiosErrorLike;
        if (e.response) {
            throw new Error(e.response.data?.message || "Login failed");
        }
        throw new Error(e.message || "Network error");
    }
}