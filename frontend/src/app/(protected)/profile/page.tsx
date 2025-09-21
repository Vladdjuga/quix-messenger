"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useProfile } from "@/lib/hooks/data/profile/useProfile";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileInformation from "@/components/profile/ProfileInformation";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import LoadingSpinner from "@/components/profile/LoadingSpinner";
import ErrorDisplay from "@/components/profile/ErrorDisplay";
import Toast from "@/components/common/Toast";

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const username = searchParams.get("username");
  const saved = searchParams.get("saved");
  const [showSaved, setShowSaved] = useState(false);

  const { profile, loading, error, refetch, setProfile } = useProfile(username);

  useEffect(() => {
    if (saved === "1") {
      setShowSaved(true);
      // Ensure latest data
      refetch();
      // Remove the saved=1 param from URL
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.delete("saved");
      router.replace(`/profile${params.size ? `?${params.toString()}` : ""}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={refetch} />;
  }

  if (!profile) {
    return <ErrorDisplay error="Profile not found" />;
  }

  return (
    <div className="min-h-screen bg-background">
      {showSaved && <Toast message="Profile saved" onClose={() => setShowSaved(false)} />}
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