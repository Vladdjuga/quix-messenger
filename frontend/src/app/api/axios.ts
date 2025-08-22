// lib/api/axios.ts
import axios from "axios";
import { localStorageShim as localStorage } from "@/lib/shims/localStorage";

const apiClient = axios.create({
    baseURL: "/api",
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else if (token) {
            resolve(token);
        } else {
            reject(new Error("No token provided"));
        }
    });
    failedQueue = [];
};

// Request interceptor - add token to requests
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("jwt");
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh on 401
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Only handle 401 errors and avoid infinite loops
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ 
                        resolve: (token: string) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            resolve(apiClient(originalRequest));
                        },
                        reject
                    });
                });
            }

            isRefreshing = true;

            try {
                console.log("Attempting to refresh token...");
                const response = await axios.post("/api/auth/refresh", {}, { 
                    withCredentials: true 
                });
                
                // The refresh endpoint returns { accessToken: "..." }
                const newToken = response.data.accessToken;
                
                if (!newToken) {
                    throw new Error("No access token received from refresh endpoint");
                }

                localStorage.setItem("jwt", newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                
                processQueue(null, newToken);
                console.log("Token refreshed successfully");

                return apiClient(originalRequest);
            } catch (refreshError) {
                console.error("Token refresh failed:", refreshError);
                processQueue(refreshError, null);
                localStorage.removeItem("jwt");
                
                // Redirect to login if refresh fails
                if (typeof window !== "undefined") {
                    window.location.href = "/login";
                }
                
                throw refreshError;
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;