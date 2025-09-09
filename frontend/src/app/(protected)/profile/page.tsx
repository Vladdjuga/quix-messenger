"use client";

import { useSearchParams } from "next/navigation";
import { useProfile } from "@/lib/hooks/data/profile/useProfile";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileInformation from "@/components/profile/ProfileInformation";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import LoadingSpinner from "@/components/profile/LoadingSpinner";
import ErrorDisplay from "@/components/profile/ErrorDisplay";

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const username = searchParams.get("username");
  
  const { profile, loading, error, refresh, setProfile } = useProfile(username);

  if (loading) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={refresh} />;
  }

  if (!profile) {
    return <ErrorDisplay error="Profile not found" />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Profile Header */}
      <ProfileHeader
        profile={profile}
        onProfileUpdate={setProfile}
      />

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <ProfileInformation profile={profile} />
          </div>

          {/* Sidebar */}
          <ProfileSidebar profile={profile} />
        </div>
      </div>
    </div>
  );
}