import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { getToken, clearToken } from "@/app/api/token";
import { toApiError } from "@/app/api/errors";
import { refreshAuthTokenUseCase } from "@/lib/usecases/auth/refreshTokenUseCase";

const apiClient: AxiosInstance = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

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
      try {
        const newToken = await refreshAuthTokenUseCase();
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        return apiClient.request(originalRequest);
      } catch (refreshError) {
        redirectToLogin();
        throw refreshError;
      }
    }

    return Promise.reject(toApiError(error));
  }
);

export default apiClient;
