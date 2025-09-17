import {api} from "@/app/api";
import apiClient from "@/app/api/http";

export async function logoutUseCase(): Promise<void> {
    try {
        // Call logout endpoint to invalidate server-side session
        await api.auth.logout();
        console.log("Logout successful");
    } catch (error) {
        console.error("Logout API call failed:", error);
        // Continue with client-side cleanup even if server call fails
    } finally {
        // Always clear client-side data
        localStorage.removeItem("jwt");
    delete apiClient.defaults.headers.common["Authorization"];
        
        // Redirect to login page
        if (typeof window !== "undefined") {
            window.location.href = "/login";
        }
    }
}