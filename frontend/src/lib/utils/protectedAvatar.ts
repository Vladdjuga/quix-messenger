import { getToken } from '@/app/api/token';

export async function getProtectedAvatarUrl(userId: string): Promise<string | null> {
  try {
    const token = getToken();
    if (!token) return null;
    const res = await fetch(`/api/user/avatar/get/${encodeURIComponent(userId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}
