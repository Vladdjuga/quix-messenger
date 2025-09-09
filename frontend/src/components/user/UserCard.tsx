import React from 'react';
import { UserWithStatus } from '@/lib/hooks/data/user/useUserSearch';
import { useFriendshipActions } from '@/lib/hooks/data/profile/useFriendshipActions';
import { UserStatus } from '@/lib/types/enums';

interface UserCardProps {
  userWithStatus: UserWithStatus;
  onStatusUpdate: (username: string, newStatus: UserStatus, friendshipId?: string) => void;
  onUserRemove?: (username: string) => void;
  showActions?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ 
  userWithStatus, 
  onStatusUpdate, 
  onUserRemove, 
  showActions = true 
}) => {
  const { user, status, friendshipId } = userWithStatus;
  const { 
    sending, 
    error, 
    sendFriendRequest, 
    acceptFriendRequest, 
    cancelFriendRequest, 
    rejectFriendRequest,
    clearError 
  } = useFriendshipActions();

  async function handleSendRequest() {
    clearError();
    const result = await sendFriendRequest(user.username);
    if (result.success) {
      onStatusUpdate(user.username, UserStatus.PendingSent);
    }
  }

  async function handleAcceptRequest() {
    if (!friendshipId) return;
    clearError();
    const result = await acceptFriendRequest(friendshipId);
    if (result.success) {
      onStatusUpdate(user.username, UserStatus.Friends, friendshipId);
    }
  }

  async function handleCancelRequest() {
    if (!friendshipId) return;
    clearError();
    const result = await cancelFriendRequest(friendshipId);
    if (result.success) {
      onStatusUpdate(user.username, UserStatus.NotFriends);
    }
  }

  async function handleRejectRequest() {
    if (!friendshipId) return;
    clearError();
    const result = await rejectFriendRequest(friendshipId);
    if (result.success) {
      onUserRemove?.(user.username);
    }
  }

  async function viewProfile(){
    const username = user.username;
    window.location.href = `/profile?username=${username}`;
  }

  function renderStatusButton() {
    if (!showActions) return null;

    switch (status) {
      case UserStatus.Friends:
        return (
          <div className="flex space-x-2">
            <span className="text-green-500 text-sm font-medium bg-green-500/10 px-3 py-2 rounded-lg flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Friends
            </span>
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
          <span className="text-secondary font-medium text-lg">
            {user.firstName.charAt(0).toUpperCase()}{user.lastName.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* User Info */}
        <div>
          <p className="font-medium text-primary">{user.username}</p>
          <p className="text-sm text-muted">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-muted">{user.email}</p>
        </div>
      </div>

      {/* Status/Actions */}
      <div className="flex flex-col items-end">
        {error && (
          <p className="text-red-500 text-xs mb-2">{error}</p>
        )}
        {renderStatusButton()}
      </div>
    </div>
  );
};

export default UserCard;
