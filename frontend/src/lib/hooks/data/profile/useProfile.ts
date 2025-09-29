import { useState, useEffect, useCallback, useMemo } from 'react';
import type { User } from "@/lib/types";
import { api } from "@/app/api";
import { useCurrentUser } from "@/lib/hooks/data/user/userHook";
import { UserStatus } from "@/lib/types/enums";
import { useUserPresencePolling } from "@/lib/hooks/data/user/useUserPresencePolling";
import { mapReadUserDto } from "@/lib/mappers/userMapper";

type UserRelationshipStatus = UserStatus | UserStatus.Self;

export interface ProfileData extends User {
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

  // Relationship status will be provided by the backend in user search results now.

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

  // Search for the user by username (now includes relationship status)
      const userResponse = await api.user.searchUsers(username, 1);
      const usersDto = userResponse.data;
      const userDto = usersDto.find(u => u.username === username);

      if (!userDto) {
        setError("User not found");
        return;
      }
      const userData = mapReadUserDto(userDto);

      setProfile({
        ...userData,
        status: (userData.relationshipStatus ?? UserStatus.NotFriends) as UserRelationshipStatus,
        friendshipId: userData.friendshipId,
        privateChatId: userData.privateChatId
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
