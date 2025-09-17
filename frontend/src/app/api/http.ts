import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { getToken, setToken, clearToken } from "@/app/api/token";
import { toApiError } from "@/app/api/errors";

type AuthResponse = { accessToken: string } | string;

type QueueItem = { resolve: () => void; reject: (error: Error) => void };

const apiClient: AxiosInstance = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  failedQueue = [];
};

const redirectToLogin = () => {
  if (typeof window !== "undefined") {
    try { clearToken(); } catch { /* ignore */ }
    window.location.href = "/login";
  }
};

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const errObj = error as { config?: InternalAxiosRequestConfig & { _retry?: boolean }, response?: { status?: number } };
    const originalRequest = errObj.config;

    if (errObj.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve: () => resolve(apiClient.request(originalRequest)), reject });
        });
      }

      isRefreshing = true;

      try {
        const response = await axios.post<AuthResponse>("/api/auth/refresh", {}, { withCredentials: true });
        const raw = response.data;
        const newToken = typeof raw === "string" ? raw : raw.accessToken;
        if (!newToken || newToken.split(".").length !== 3) throw new Error("Invalid token received");

        setToken(newToken);
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        processQueue(null);

        return apiClient.request(originalRequest);
      } catch (refreshError) {
        const errRefresh = refreshError instanceof Error ? refreshError : new Error("Token refresh failed");
        processQueue(errRefresh);
        redirectToLogin();
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(toApiError(error));
  }
);

export default apiClient;
