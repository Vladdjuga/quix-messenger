import React from 'react';
import { ProfileData } from '@/lib/hooks/data/profile/useProfile';

interface ProfileInformationProps {
  profile: ProfileData;
}

const ProfileInformation: React.FC<ProfileInformationProps> = ({ profile }) => {
  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  }
  return (
    <div className="bg-surface rounded-lg border border-default p-6">
      <h2 className="text-lg font-semibold text-primary mb-4">Information</h2>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-surface-elevated rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-primary">{profile.firstName} {profile.lastName}</p>
            <p className="text-sm text-muted">Full name</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-surface-elevated rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-primary">{profile.email}</p>
            <p className="text-sm text-muted">Email</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-surface-elevated rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6m6 0a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h12a2 2 0 012 2v10z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-primary">{formatDate(profile.dateOfBirth)}</p>
            <p className="text-sm text-muted">Date of birth</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-surface-elevated rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-primary">Member since {formatDate(profile.createdAt)}</p>
            <p className="text-sm text-muted">Joined</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInformation;
