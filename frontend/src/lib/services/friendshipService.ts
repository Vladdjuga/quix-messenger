import { ReadFriendshipDto } from "@/lib/dto/ReadFriendshipDto";
import { api } from "@/app/api";

const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE ?? 20);

export async function fetchFriendRequests(): Promise<ReadFriendshipDto[]> {
  try {
    const response = await api.friendship.getFriendRequests("", PAGE_SIZE);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch friend requests:', error);
    throw new Error('Failed to load friend requests');
  }
}

export async function fetchSentRequests(): Promise<ReadFriendshipDto[]> {
  try {
    const response = await api.friendship.getSentRequests("", PAGE_SIZE);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch sent requests:', error);
    throw new Error('Failed to load sent requests');
  }
}

export async function fetchFriendships(): Promise<ReadFriendshipDto[]> {
  try {
    const response = await api.friendship.getFriendships(PAGE_SIZE);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch friendships:', error);
    throw new Error('Failed to load friendships');
  }
}
