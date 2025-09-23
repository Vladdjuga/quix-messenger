import { useState, useEffect, useCallback, useMemo } from 'react';
import { ReadUserDto } from "@/lib/dto/ReadUserDto";
import { api } from "@/app/api";
import { useCurrentUser } from "@/lib/hooks/data/user/userHook";
import { UserStatus } from "@/lib/types/enums";
import { useUserPresencePolling } from "@/lib/hooks/data/user/useUserPresencePolling";

type UserRelationshipStatus = UserStatus | UserStatus.Self;

export interface ProfileData extends ReadUserDto {
  status: UserRelationshipStatus;
  friendshipId?: string;
  privateChatId?: string;
  isOnline?: boolean;
  lastSeen?: Date;
}

export function useProfile(username?: string | null) {
  const { user: currentUser, loading: currentUserLoading } = useCurrentUser();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Presence hook based on the resolved profile id (safe to pass null initially)
  const { isOnline, lastSeenAt } = useUserPresencePolling(profile?.id ?? null, { 
    intervalMs: 10000, 
    enabled: true, 
    immediate: true 
  });

  async function getFriendshipStatus(username: string): Promise<{ status: UserRelationshipStatus; friendshipId?: string; privateChatId?: string }> {
    try {
      const [requests, sentRequests, friends] = await Promise.all([
        api.friendship.getFriendRequests("", 50).then(res => res.data),
        api.friendship.getSentRequests("", 50).then(res => res.data),
        api.friendship.getFriendships(50).then(res => res.data),
      ]);

      const friend = friends.find(f => f.username === username);
      if (friend) return { status: UserStatus.Friends, friendshipId: friend.id, privateChatId: friend.privateChatId };
      
      const request = requests.find(r => r.username === username);
      if (request) return { status: UserStatus.PendingReceived, friendshipId: request.id };
      
      const sentRequest = sentRequests.find(r => r.username === username);
      if (sentRequest) return { status: UserStatus.PendingSent, friendshipId: sentRequest.id };
      
      return { status: UserStatus.NotFriends };
    } catch {
      return { status: UserStatus.NotFriends };
    }
  }

  const loadProfile = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);

      // If no username provided or it's current user's username, show current user profile
      if (!username || username === currentUser.username) {
        const profileData: ProfileData = {
          ...currentUser,
          status: UserStatus.Self
        };
        setProfile(profileData);
        return;
      }

      // Search for the user by username
      const userResponse = await api.user.searchUsers(username, 1);
      const users = userResponse.data;
      const userData = users.find(u => u.username === username);

      if (!userData) {
        setError("User not found");
        return;
      }

      // Get friendship status
      const friendshipInfo = await getFriendshipStatus(userData.username);

      setProfile({
        ...userData,
        status: friendshipInfo.status,
        friendshipId: friendshipInfo.friendshipId,
        privateChatId: friendshipInfo.privateChatId
      });
    } catch (e) {
      setError((e as Error).message ?? "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [currentUser, username]);

  useEffect(() => {
    if (currentUserLoading) return;
    if (!currentUser) return;
    loadProfile();
  }, [currentUser, username, currentUserLoading, loadProfile]);

  const mergedProfile = useMemo(() => {
    if (!profile) return null;
    return { 
      ...profile, 
      isOnline: isOnline ?? profile.isOnline,
      lastSeen: lastSeenAt ? new Date(lastSeenAt) : profile.lastSeen
    } as ProfileData;
  }, [profile, isOnline, lastSeenAt]);

  return {
    profile: mergedProfile,
    loading: loading || currentUserLoading,
    error,
    refetch: loadProfile,
    setProfile
  };
}
