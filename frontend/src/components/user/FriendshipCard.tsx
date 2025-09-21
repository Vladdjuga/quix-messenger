"use client";
import React from 'react';
import { ReadFriendshipDto } from '@/lib/dto/ReadFriendshipDto';
import { useFriendshipActions } from '@/lib/hooks/data/profile/useFriendshipActions';
import { UserStatus } from '@/lib/types/enums';
import { useRouter } from 'next/navigation';

interface FriendshipCardProps {
  friendship: ReadFriendshipDto;
  type: UserStatus.PendingReceived | UserStatus.PendingSent | UserStatus.Friends;
  onRemove: (friendshipId: string) => void;
  onAccept?: (friendshipId: string) => void;
}

const FriendshipCard: React.FC<FriendshipCardProps> = ({ 
  friendship, 
  type, 
  onRemove, 
  onAccept 
}) => {
  const router = useRouter();
  const { 
    sending, 
    error, 
    acceptFriendRequest, 
    cancelFriendRequest, 
    rejectFriendRequest,
    clearError 
  } = useFriendshipActions();

  async function handleAccept() {
    clearError();
    const result = await acceptFriendRequest(friendship.id);
    if (result.success) {
      onAccept?.(friendship.id);
    }
  }

  async function handleReject() {
    clearError();
    const result = await rejectFriendRequest(friendship.id);
    if (result.success) {
      onRemove(friendship.id);
    }
  }

  async function handleCancel() {
    clearError();
    const result = await cancelFriendRequest(friendship.id);
    if (result.success) {
      onRemove(friendship.id);
    }
  }

  async function viewProfile(){
    const username = friendship.username;
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
    switch (type) {
      case UserStatus.PendingReceived:
        return (
          <div className="flex space-x-2">
            <button
              onClick={handleAccept}
              disabled={sending}
              className="btn-primary text-sm"
            >
              {sending ? "Accepting..." : "Accept"}
            </button>
            <button
              onClick={handleReject}
              disabled={sending}
              className="text-red-500 text-sm px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors"
            >
              {sending ? "Rejecting..." : "Reject"}
            </button>
          </div>
        );
      
      case UserStatus.PendingSent:
        return (
          <button
            onClick={handleCancel}
            disabled={sending}
            className="text-red-500 text-sm px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors"
          >
            {sending ? "Canceling..." : "Cancel Request"}
          </button>
        );
      
      case UserStatus.Friends:
        return (
          <div className="flex space-x-2">
            <button className="btn-secondary text-sm" onClick={() => {
              if (friendship.privateChatId) router.push(`/chats/${encodeURIComponent(friendship.privateChatId)}`);
              else router.push('/chats');
            }}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Message
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
        return null;
    }
  }

  return (
    <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-default hover:bg-surface-elevated transition-colors">
      <div className="flex items-center space-x-4">
        {/* Avatar */}
        <div className="w-12 h-12 bg-surface-elevated rounded-full flex items-center justify-center border border-default">
          <span className="text-secondary font-medium text-lg">
            {friendship.username.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* User Info */}
        <div>
          <p className="font-medium text-primary">{friendship.username}</p>
          <p className="text-sm text-muted">{friendship.email}</p>
          <p className="text-xs text-muted">
            {type === UserStatus.PendingReceived && `Sent ${formatDate(friendship.createdAt)}`}
            {type === UserStatus.PendingSent && `Requested ${formatDate(friendship.createdAt)}`}
            {type === UserStatus.Friends && `Friends since ${formatDate(friendship.createdAt)}`}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-end">
        {error && (
          <p className="text-red-500 text-xs mb-2">{error}</p>
        )}
        {renderActions()}
      </div>
    </div>
  );
};

export default FriendshipCard;
