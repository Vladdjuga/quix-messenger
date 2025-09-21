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
            <button className="w-full btn-secondary justify-start">
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>
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
