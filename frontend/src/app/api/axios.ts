import axios from "axios";
// Using legacy @types/axios; declare minimal local types for generics
type AxiosRequestConfig = any;
interface AxiosErrorLike { response?: { status: number; data?: any }; message: string; config?: any; }

// Define types for better type safety
interface AuthResponse { accessToken: string; }

export interface ApiErrorShape {
    status: number;
    code?: string;
    message: string;
    details?: unknown;
}

export class ApiError extends Error implements ApiErrorShape {
    status: number;
    code?: string;
    details?: unknown;
    constructor(shape: ApiErrorShape) {
        super(shape.message);
        this.status = shape.status;
        this.code = shape.code;
        this.details = shape.details;
    }
}

interface QueueItem {
    resolve: (token: string) => void;
    reject: (error: Error) => void;
}

// For client-side requests, we should use Next.js API routes, not direct backend URLs
const apiClient = axios.create({
    baseURL: '/api', // This will use Next.js API routes
    headers: {
        "Content-Type": "application/json",
    },
});

let isRefreshing = false;
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 3;
let failedQueue: QueueItem[] = [];

const getToken = (): string | null => {
    const token = localStorage.getItem("jwt");
    if (!token) return null;
    
    // Clean token - remove quotes, whitespace, and Bearer prefix
    const cleaned = token.replace(/["'\s\r\n]/g, '')
        .replace(/^bearer\s*/i, '');
    
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

// Normalize errors (non-401 handled here; 401 has refresh logic below)
function toApiError(err: unknown): ApiError {
    if (err instanceof ApiError) return err;
    const ax = err as AxiosErrorLike;
    const status = ax?.response?.status ?? 0;
    const data = ax?.response?.data;
    const shape: ApiErrorShape = {
        status,
        code: data?.code || data?.error || undefined,
        message: data?.message || ax?.message || 'Request failed',
        details: data?.details || data
    };
    return new ApiError(shape);
}

apiClient.interceptors.response.use(
    (response) => { refreshAttempts = 0; return response; },
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
                const response = await axios
                    .post<AuthResponse>("/api/auth/refresh", {}, { withCredentials: true });
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

        // Non-refresh path: wrap error
        return Promise.reject(toApiError(error));
    }
);

export const resetRefreshAttempts = () => {
    refreshAttempts = 0;
};

// Generic request helpers ----------------------------------------------------
type RequestConfig<T> = AxiosRequestConfig & { parse?: (raw: any) => T };

export async function getTyped<T>(url: string, config: RequestConfig<T> = {}): Promise<T> {
    try {
        const resp = await apiClient.get(url, config);
        return config.parse ? config.parse(resp.data) : resp.data as T;
    } catch (e) {
        throw toApiError(e);
    }
}

export async function postTyped<TReq, TResp>(url: string, body: TReq, config: RequestConfig<TResp> = {}): Promise<TResp> {
    try {
        const resp = await apiClient.post(url, body, config);
        return config.parse ? config.parse(resp.data) : resp.data as TResp;
    } catch (e) {
        throw toApiError(e);
    }
}

export { toApiError };

export default apiClient;
