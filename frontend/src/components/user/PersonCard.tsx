"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { ReadFriendshipDto } from '@/lib/dto/ReadFriendshipDto';
import { ReadUserDto } from '@/lib/dto/ReadUserDto';
import { useFriendshipActions } from '@/lib/hooks/data/profile/useFriendshipActions';
import { UserStatus } from '@/lib/types/enums';
import { useRouter } from 'next/navigation';
import { getProtectedAvatarUrl } from '@/lib/utils/protectedAvatar';
import Image from 'next/image';

// Unified person data type
export interface PersonData {
  id: string;
  avatarUrl: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  createdAt?: Date;
  privateChatId?: string; // For messaging functionality
}

interface PersonCardProps {
  person: PersonData;
  status: UserStatus;
  friendshipId?: string;
  onStatusUpdate?: (identifier: string, newStatus: UserStatus, friendshipId?: string) => void;
  onPersonRemove?: (identifier: string) => void;
  showActions?: boolean;
  showRelationshipDate?: boolean;
  identifier: string; // Can be username or friendshipId depending on context
}

const PersonCard: React.FC<PersonCardProps> = ({ 
  person, 
  status, 
  friendshipId,
  onStatusUpdate, 
  onPersonRemove, 
  showActions = true,
  showRelationshipDate = false,
  identifier
}) => {
  const router = useRouter();
  const { 
    sending, 
    error, 
    sendFriendRequest,
    acceptFriendRequest, 
    cancelFriendRequest, 
    rejectFriendRequest,
    clearError 
  } = useFriendshipActions();

  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);

  const updateAvatar = useCallback((userId: string) => {
    let revoked: string | null = null;
    (async () => {
      if (!userId) { setAvatarSrc(null); return; }
      const url = await getProtectedAvatarUrl(userId);
      if (url) {
        setAvatarSrc(url);
        revoked = url; // remember to revoke on cleanup
      } else {
        setAvatarSrc(null);
      }
    })();
    return () => { if (revoked) URL.revokeObjectURL(revoked); };
  }, []);

  useEffect(() => {
    // Re-fetch avatar if avatarUrl changes (indicates a new upload)
    return updateAvatar(person.id);
  }, [person.id, person.avatarUrl, updateAvatar]);

  async function handleSendRequest() {
    clearError();
    const result = await sendFriendRequest(person.username);
    if (result.success) {
      onStatusUpdate?.(identifier, UserStatus.PendingSent);
    }
  }

  async function handleAcceptRequest() {
    if (!friendshipId) return;
    clearError();
    const result = await acceptFriendRequest(friendshipId);
    if (result.success) {
      onStatusUpdate?.(identifier, UserStatus.Friends, friendshipId);
    }
  }

  async function handleCancelRequest() {
    if (!friendshipId) return;
    clearError();
    const result = await cancelFriendRequest(friendshipId);
    if (result.success) {
      onStatusUpdate?.(identifier, UserStatus.NotFriends);
    }
  }

  async function handleRejectRequest() {
    if (!friendshipId) return;
    clearError();
    const result = await rejectFriendRequest(friendshipId);
    if (result.success) {
      onPersonRemove?.(identifier);
    }
  }

  async function viewProfile(){
    const username = person.username;
    window.location.href = `/profile?username=${username}`;
  }

  function formatDate(dateString: Date) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString));
  }

  function renderActions() {
    if (!showActions) return null;

    switch (status) {
      case UserStatus.Friends:
        return (
          <div className="flex space-x-2">
            {friendshipId ? (
              <button className="btn-secondary text-sm" onClick={() => {
                // For friendship context, we might have privateChatId available
                if (person.privateChatId) router.push(`/chats/${encodeURIComponent(person.privateChatId)}`);
                else router.push('/chats');
              }}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Message
              </button>
            ) : (
              <span className="text-green-500 text-sm font-medium bg-green-500/10 px-3 py-2 rounded-lg flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Friends
              </span>
            )}
            <button
                className="text-muted text-sm px-3 py-2 rounded-lg hover:bg-surface-elevated transition-colors"
                onClick={viewProfile}
            >
              View Profile
            </button>
          </div>
        );
      
      case UserStatus.PendingSent:
        return (
          <div className="flex space-x-2">
            <span className="text-blue-500 text-sm bg-blue-500/10 px-3 py-2 rounded-lg flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Request sent
            </span>
            <button
              onClick={handleCancelRequest}
              disabled={sending}
              className="text-red-500 text-sm px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors"
            >
              {sending ? "Canceling..." : "Cancel"}
            </button>
            <button
              className="text-muted text-sm px-3 py-2 rounded-lg hover:bg-surface-elevated transition-colors"
              onClick={viewProfile}
            >
              View Profile
            </button>
          </div>
        );
      
      case UserStatus.PendingReceived:
        return (
          <div className="flex space-x-2">
            <button
              onClick={handleAcceptRequest}
              disabled={sending}
              className="btn-primary text-sm"
            >
              {sending ? "Accepting..." : "Accept"}
            </button>
            <button
              onClick={handleRejectRequest}
              disabled={sending}
              className="text-red-500 text-sm px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors"
            >
              {sending ? "Rejecting..." : "Reject"}
            </button>
            <button
              className="text-muted text-sm px-3 py-2 rounded-lg hover:bg-surface-elevated transition-colors"
              onClick={viewProfile}
            >
              View Profile
            </button>
          </div>
        );
      
      default:
        return (
          <div className="flex space-x-2">
            <button
              disabled={sending}
              onClick={handleSendRequest}
              className="btn-primary text-sm"
            >
              {sending ? "Sending..." : "Add Friend"}
            </button>
            <button
              className="text-muted text-sm px-3 py-2 rounded-lg hover:bg-surface-elevated transition-colors"
              onClick={viewProfile}
            >
              View Profile
            </button>
          </div>
        );
    }
  }

  return (
    <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-default hover:bg-surface-elevated transition-colors">
      <div className="flex items-center space-x-4">
        {/* Avatar */}
        <div className="w-12 h-12 bg-surface-elevated rounded-full flex items-center justify-center border border-default">
          {avatarSrc ? (
            <Image
              src={avatarSrc}
              alt={person.firstName && person.lastName ? `${person.firstName} ${person.lastName}` : person.username}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover"
              unoptimized
            />
          ) : (
            <span className="text-secondary font-medium text-lg">
              {person.firstName && person.lastName 
                ? `${person.firstName.charAt(0).toUpperCase()}${person.lastName.charAt(0).toUpperCase()}`
                : person.username.charAt(0).toUpperCase()
              }
            </span>
          )}
        </div>

        {/* User Info */}
        <div>
          <p className="font-medium text-primary">{person.username}</p>
          {person.firstName && person.lastName ? (
            <p className="text-sm text-muted">
              {person.firstName} {person.lastName}
            </p>
          ) : (
            <p className="text-sm text-muted">{person.email}</p>
          )}
          {showRelationshipDate && person.createdAt && (
            <p className="text-xs text-muted">
              {status === UserStatus.PendingReceived && `Sent ${formatDate(person.createdAt)}`}
              {status === UserStatus.PendingSent && `Requested ${formatDate(person.createdAt)}`}
              {status === UserStatus.Friends && `Friends since ${formatDate(person.createdAt)}`}
            </p>
          )}
          {!showRelationshipDate && person.email && person.firstName && person.lastName && (
            <p className="text-xs text-muted">{person.email}</p>
          )}
        </div>
      </div>

      {/* Status/Actions */}
      <div className="flex flex-col items-end">
        {error && (
          <p className="text-red-500 text-xs mb-2">{error}</p>
        )}
        {renderActions()}
      </div>
    </div>
  );
};

export default PersonCard;

// Helper functions to convert existing data types to PersonData
export function userToPersonData(user: ReadUserDto): PersonData {
  return {
    id: user.id,
    avatarUrl: user.avatarUrl,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    dateOfBirth: user.dateOfBirth,
    createdAt: user.createdAt
  };
}

export function friendshipToPersonData(friendship: ReadFriendshipDto): PersonData {
  return {
    id: friendship.userId,
    avatarUrl: friendship.avatarUrl,
    username: friendship.username,
    email: friendship.email,
    dateOfBirth: friendship.dateOfBirth,
    createdAt: friendship.createdAt,
    privateChatId: friendship.privateChatId
  };
}