import {api} from "@/app/api";

export async function logoutUseCase(): Promise<void> {
    try {
        await api.auth.logout();
        localStorage.removeItem("jwt");
        console.log("Logout successful");
    } catch (err: any) {
        const msg =
            err.response?.data?.message || err.message || "Logout failed";
        throw new Error(msg);
    }
}