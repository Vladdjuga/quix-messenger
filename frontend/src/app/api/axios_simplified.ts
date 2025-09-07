import axios from "axios";

const MESSAGE_SERVICE_URL = process.env.NEXT_PUBLIC_MESSAGE_SERVICE_URL || "http://localhost:5173";

const apiClient = axios.create({
    baseURL: MESSAGE_SERVICE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

let isRefreshing = false;
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 3;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: Error) => void; }> = [];

const getToken = (): string | null => {
    const token = localStorage.getItem("jwt");
    if (!token) return null;
    
    // Clean token - remove quotes, whitespace, and Bearer prefix
    const cleaned = token.replace(/["'\s\r\n]/g, '').replace(/^bearer\s*/i, '');
    
    // Validate JWT format (should have 3 parts)
    if (cleaned.split('.').length !== 3) {
        localStorage.removeItem("jwt");
        return null;
    }
    
    return cleaned;
};

const processQueue = (error: Error | null, token: string | null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else if (token) {
            resolve(token);
        }
    });
    failedQueue = [];
};

const redirectToLogin = () => {
    localStorage.removeItem("jwt");
    if (typeof window !== "undefined") {
        window.location.href = "/login";
    }
};

// Add token to requests
apiClient.interceptors.request.use((config) => {
    const token = getToken();
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle token refresh on 401
apiClient.interceptors.response.use(
    (response) => {
        refreshAttempts = 0; // Reset on success
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
                redirectToLogin();
                return Promise.reject(error);
            }

            if (isRefreshing) {
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
                const response = await axios.post("/api/auth/refresh", {}, { withCredentials: true });
                const newToken = response.data.accessToken;

                if (!newToken || newToken.split('.').length !== 3) {
                    throw new Error("Invalid token received");
                }

                localStorage.setItem("jwt", newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                
                processQueue(null, newToken);
                refreshAttempts = 0;

                return apiClient(originalRequest);
            } catch (refreshError) {
                const error = refreshError instanceof Error ? refreshError : new Error('Token refresh failed');
                processQueue(error, null);
                redirectToLogin();
                throw refreshError;
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export const resetRefreshAttempts = () => {
    refreshAttempts = 0;
};

export default apiClient;
