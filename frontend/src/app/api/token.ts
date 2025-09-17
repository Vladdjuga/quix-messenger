// SSR-safe token utilities
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = window.localStorage.getItem("jwt");
  if (!token) return null;
  const cleaned = token.replace(/["'\s\r\n]/g, "").replace(/^bearer\s*/i, "");
  if (cleaned.split(".").length !== 3) {
    try { window.localStorage.removeItem("jwt"); } catch { /* ignore */ }
    return null;
  }
  return cleaned;
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem("jwt", token); } catch { /* ignore */ }
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem("jwt"); } catch { /* ignore */ }
}
