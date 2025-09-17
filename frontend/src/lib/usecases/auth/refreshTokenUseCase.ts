import axios from "axios";
import { getToken, setToken, clearToken } from "@/app/api/token";
import { refreshSocketAuth } from "@/lib/socket/socket";

export type AuthResponse = { accessToken: string } | string;

let isRefreshing = false;
let waiters: Array<{ resolve: (token: string) => void; reject: (e: Error) => void }> = [];

function flush(error: Error | null, token?: string) {
  const list = waiters;
  waiters = [];
  for (const { resolve, reject } of list) {
    if (error) reject(error);
    else if (token) resolve(token);
  }
}

export async function refreshAuthTokenUseCase(): Promise<string> {
  if (isRefreshing) {
    return new Promise((resolve, reject) => waiters.push({ resolve, reject }));
  }
  isRefreshing = true;
  try {
    const res = await axios.post<AuthResponse>("/api/auth/refresh", {}, { withCredentials: true });
    const raw = res.data;
    const newToken = typeof raw === "string" ? raw : raw.accessToken;
    if (!newToken || newToken.split(".").length !== 3) throw new Error("Invalid token received");
    setToken(newToken);
    refreshSocketAuth(newToken);
    flush(null, newToken);
    return newToken;
  } catch (e) {
    const err = e instanceof Error ? e : new Error("Token refresh failed");
    try { clearToken(); } catch {}
    flush(err);
    throw err;
  } finally {
    isRefreshing = false;
  }
}

export async function getValidTokenOrRefreshUseCase(): Promise<string | null> {
  const token = getToken();
  if (token) return token;
  try {
    return await refreshAuthTokenUseCase();
  } catch {
    return null;
  }
}
