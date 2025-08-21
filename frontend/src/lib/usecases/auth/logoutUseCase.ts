import {api} from "@/app/api";

type AxiosErrorLike = { response?: { data?: { message?: string } }; message?: string };

export async function logoutUseCase(): Promise<void> {
    try {
        await api.auth.logout();
        localStorage.removeItem("jwt");
        console.log("Logout successful");
    } catch (err) {
        const e = err as AxiosErrorLike;
        const msg = e.response?.data?.message || e.message || "Logout failed";
        throw new Error(msg);
    }
}