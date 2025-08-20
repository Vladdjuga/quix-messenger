// lib/api/axios.ts
import axios from "axios";

const apiClient = axios.create({
    baseURL: "/api",
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: Function; reject: Function }> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token);
    });
    failedQueue = [];
};

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("jwt");
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

apiClient.interceptors.response.use(
    (res) => res,
    async (err) => {
        const originalRequest = err.config;

        if (err.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return apiClient(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem("refreshToken");
                if (!refreshToken) throw new Error("No refresh token");

                const res = await axios.post("/api/auth/refresh", { refreshToken });
                const newAccessToken = res.data.accessToken;
                localStorage.setItem("jwt", newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                processQueue(null, newAccessToken);

                return apiClient(originalRequest);
            } catch (e) {
                processQueue(e, null);
                throw e;
            } finally {
                isRefreshing = false;
            }
        }

        throw err;
    }
);

export default apiClient;