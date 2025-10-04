import { getToken } from '@/app/api/token';

/**
 * Utility to fetch and create a blob URL for a protected user avatar
 */
export async function getProtectedUserAvatarUrl(userId: string): Promise<string | null> {
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

/**
 * Utility to fetch and create a blob URL for a protected chat avatar
 */
export async function getProtectedChatAvatarUrl(chatId: string): Promise<string | null> {
    try {
        const response = await fetch(`/api/chats/getChatAvatar/${chatId}`, {
            credentials: 'include', // Include auth cookies
        });

        if (!response.ok) {
            console.warn(`Failed to fetch chat avatar for ${chatId}:`, response.statusText);
            return null;
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error('Error fetching protected chat avatar:', error);
        return null;
    }
}