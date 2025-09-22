"use client";
import React from 'react';
import { ProfileData } from '@/lib/hooks/data/profile/useProfile';
import { UserStatus } from '@/lib/types/enums';
import Link from 'next/link';

interface ProfileSidebarProps {
  profile: ProfileData;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ profile }) => {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      {profile.status === UserStatus.Self && (
        <div className="bg-surface rounded-lg border border-default p-6">
          <h3 className="font-semibold text-primary mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/profile/edit" className="w-full btn-secondary justify-start inline-flex">
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </Link>
          </div>
        </div>
      )}

      {/* Contact Info */}
      <div className="bg-surface rounded-lg border border-default p-6">
        <h3 className="font-semibold text-primary mb-4">Contact</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-surface-elevated rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-secondary">@</span>
            </div>
            <div>
              <p className="text-sm font-medium text-primary">@{profile.username}</p>
              <p className="text-xs text-muted">Username</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;
