import { useEffect } from 'react';
import { useCurrentUser } from "@/lib/hooks/data/user/userHook";
import { useAsyncState } from "@/lib/hooks/useAsyncState";
import { getProfileWithStatus, ProfileData } from "@/lib/services/profileService";

export type { ProfileData };

export function useProfile(username?: string | null) {
  const { user: currentUser, loading: currentUserLoading } = useCurrentUser();
  const {
    data: profile,
    loading,
    error,
    setData: setProfile,
    setLoading,
    setError,
    reset
  } = useAsyncState<ProfileData | null>(null);

  async function loadProfile() {
    if (!currentUser || !username) {
      reset();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const profileData = await getProfileWithStatus(username, currentUser);
      setProfile(profileData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (currentUserLoading) return;
    loadProfile();
  }, [currentUser, username, currentUserLoading]);

  return {
    profile,
    loading: loading || currentUserLoading,
    error,
    refresh: loadProfile,
    setProfile
  };
}
