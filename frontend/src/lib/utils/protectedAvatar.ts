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
    const token = getToken();
    if (!token) return null;
    const res = await fetch(`/api/chats/getChatAvatar/${encodeURIComponent(chatId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;

    //Avatar may be null
    if (res.status === 204) return null;

    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch {
    return null;
    }
}

/**
 * Utility to fetch and create a blob URL for a protected attachment image
 */
export async function getProtectedAttachmentBlobUrl(attachmentId: string): Promise<string | null> {
  try {
    const token = getToken();
    if (!token) return null;
    const res = await fetch(`/api/attachments/download/${encodeURIComponent(attachmentId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}