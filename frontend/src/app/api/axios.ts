// lib/api/axios.ts
import axios from "axios";
import { localStorageShim as localStorage } from "@/lib/shims/localStorage";

// Small helper to normalize tokens coming from various sources
const cleanToken = (raw?: string | null): string | null => {
    if (!raw) return null;
    let t = raw.trim();
    // Remove surrounding quotes if present
    if (t.startsWith('"') && t.endsWith('"')) {
        t = t.slice(1, -1);
    }
    // Remove accidental Bearer prefix stored in value
    if (t.toLowerCase().startsWith('bearer ')) {
        t = t.slice(7).trim();
    }
    return t;
};

const apiClient = axios.create({
    baseURL: "/api",
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

let isRefreshing = false;
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 3;
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
        const raw = localStorage.getItem("jwt");
        const token = cleanToken(raw);
        if (token && config.headers) {
            // Validate JWT format before using it
            const tokenParts = token.split('.')
            if (tokenParts.length !== 3) {
                console.error('Invalid JWT format in localStorage - expected 3 parts, got:', tokenParts.length);
                console.error('Token:', JSON.stringify(token));
                // Remove the malformed token
                localStorage.removeItem("jwt");
                return config;
            }
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh on 401
apiClient.interceptors.response.use(
    (response) => {
        // Reset refresh attempts on successful response
        refreshAttempts = 0;
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Only handle 401 errors and avoid infinite loops
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Check if we've exceeded maximum refresh attempts
            if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
                console.error("Maximum refresh attempts exceeded, redirecting to login");
                localStorage.removeItem("jwt");
                if (typeof window !== "undefined") {
                    window.location.href = "/login";
                }
                return Promise.reject(error);
            }

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
            refreshAttempts++;

            try {
                console.log(`Attempting to refresh token... (attempt ${refreshAttempts}/${MAX_REFRESH_ATTEMPTS})`);
                const response = await axios.post("/api/auth/refresh", {}, { 
                    withCredentials: true 
                });
                
                // The refresh endpoint returns { accessToken: "..." }
                let newToken: string = response.data.accessToken;
                
                if (!newToken) {
                    throw new Error("No access token received from refresh endpoint");
                }

                // Validate JWT format before using it
                newToken = cleanToken(newToken) ?? "";
                const tokenParts = newToken.split('.');
                if (tokenParts.length !== 3) {
                    console.error('Invalid JWT format received from refresh endpoint - expected 3 parts, got:', tokenParts.length);
                    console.error('Token:', JSON.stringify(newToken));
                    throw new Error("Invalid JWT format received from refresh endpoint");
                }

                // Log token details for debugging (remove in production)
                console.log('New token length:', newToken.length);
                console.log('New token preview:', newToken.substring(0, 50) + '...');
                console.log('Token starts with Bearer?', newToken.startsWith('Bearer '));
                console.log('Token parts lengths:', tokenParts.map((part: string) => part.length));

                localStorage.setItem("jwt", newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                
                processQueue(null, newToken);
                console.log("Token refreshed successfully");
                
                // Reset refresh attempts on successful refresh
                refreshAttempts = 0;

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

// Reset refresh attempts (useful after successful login)
export const resetRefreshAttempts = () => {
    refreshAttempts = 0;
};

export default apiClient;