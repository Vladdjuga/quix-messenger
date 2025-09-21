"use client";
import React, { useState } from 'react';
import { ProfileData } from '@/lib/hooks/data/profile/useProfile';
import { useFriendshipActions } from '@/lib/hooks/data/profile/useFriendshipActions';
import { UserStatus } from '@/lib/types/enums';
import { useRouter } from 'next/navigation';
import AvatarUploadModal from './AvatarUploadModal';
import { api } from '@/app/api';
import { useCurrentUser } from '@/lib/hooks/data/user/userHook';

interface ProfileHeaderProps {
  profile: ProfileData;
  onProfileUpdate?: (updatedProfile: ProfileData) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, onProfileUpdate }) => {
  const { sending, error, sendFriendRequest, acceptFriendRequest, clearError } = useFriendshipActions();
  const router = useRouter();
  const { setUser } = useCurrentUser();
  const [avatarOpen, setAvatarOpen] = useState(false);

  function getLastSeenText(): string {
    if (!profile?.lastSeen) return "";
    
    const now = new Date();
    const diff = now.getTime() - new Date(profile.lastSeen).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  async function handleSendFriendRequest() {
    clearError();
    const result = await sendFriendRequest(profile.username);
    if (result.success && onProfileUpdate) {
      onProfileUpdate({ ...profile, status: UserStatus.PendingSent });
    }
  }

  async function handleAcceptFriendRequest() {
    if (!profile.friendshipId) return;
    clearError();
    const result = await acceptFriendRequest(profile.friendshipId);
    if (result.success && onProfileUpdate) {
      onProfileUpdate({ ...profile, status: UserStatus.Friends });
    }
  }

  function handleMessageClick() {
    // If we know the private chat id from friendship, navigate directly
    if (profile.privateChatId) {
      router.push(`/chats/${encodeURIComponent(profile.privateChatId)}`);
      return;
    }
    // Fallback: open chats list; ChatList should include their direct chat if exists
    router.push('/chats');
  }

  return (
    <div className="bg-surface border-b border-default">
      <AvatarUploadModal
        open={avatarOpen}
        onClose={() => setAvatarOpen(false)}
        onUpload={async (file) => {
          const resp = await api.user.uploadAvatar(file);
          // Update current user and profile with returned data
          setUser(resp.data);
          onProfileUpdate?.({ ...profile, ...resp.data });
        }}
      />
      <div className="max-w-4xl mx-auto">
        {/* Cover Photo */}
        <div className="h-48 bg-gradient-to-r from-accent-600 to-accent-400 relative">
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end md:space-x-6 -mt-20 relative">
            {/* Profile Picture */}
            <div className="relative">
              <div
                className={`w-32 h-32 bg-surface-elevated rounded-full border-4 border-background flex items-center justify-center shadow-lg ${profile.status === UserStatus.Self ? 'cursor-pointer hover:opacity-90' : ''}`}
                onClick={() => { if (profile.status === UserStatus.Self) setAvatarOpen(true); }}
                title={profile.status === UserStatus.Self ? 'Click to change avatar' : undefined}
              >
                <span className="text-4xl font-bold text-secondary">
                  {profile.firstName.charAt(0).toUpperCase()}{profile.lastName.charAt(0).toUpperCase()}
                </span>
              </div>
              {profile.status !== UserStatus.Self && (
                <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-background ${
                  profile.isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
              )}
            </div>

            {/* Name & Status */}
            <div className="flex-1 mt-4 md:mt-0 md:mb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-primary">
                    {profile.firstName} {profile.lastName}
                  </h1>
                  <p className="text-muted">@{profile.username}</p>
                  {profile.status !== UserStatus.Self && (
                    <p className="text-sm text-muted mt-1">
                      {profile.isOnline ? (
                        <span className="text-green-500">Online</span>
                      ) : (
                        `Last seen ${getLastSeenText()}`
                      )}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                {profile.status !== UserStatus.Self && (
                  <div className="flex flex-col space-y-2 mt-4 md:mt-0">
                    {error && (
                      <p className="text-red-500 text-sm">{error}</p>
                    )}
                    
                    <div className="flex space-x-3">
                      {profile.status === UserStatus.Friends && (
                        <>
                          <span className="flex items-center text-green-500 text-sm font-medium bg-green-500/10 px-3 py-2 rounded-lg">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Friends
                          </span>
                          <button className="btn-secondary" onClick={handleMessageClick}>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Message
                          </button>
                        </>
                      )}

                      {profile.status === UserStatus.PendingSent && (
                        <span className="flex items-center text-blue-500 text-sm bg-blue-500/10 px-3 py-2 rounded-lg">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Request sent
                        </span>
                      )}

                      {profile.status === UserStatus.PendingReceived && (
                        <button 
                          onClick={handleAcceptFriendRequest}
                          disabled={sending}
                          className="btn-primary"
                        >
                          {sending ? "Accepting..." : "Accept Request"}
                        </button>
                      )}

                      {profile.status === UserStatus.NotFriends && (
                        <button 
                          onClick={handleSendFriendRequest}
                          disabled={sending}
                          className="btn-primary"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          {sending ? "Sending..." : "Add Friend"}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
