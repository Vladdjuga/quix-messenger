import React from 'react';
import { UserWithStatus } from '@/lib/hooks/data/user/useUserSearch';
import { UserStatus } from '@/lib/types/enums';
import PersonCard, { userToPersonData } from './PersonCard';

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

  return (
    <PersonCard
      person={userToPersonData(user)}
      status={status}
      friendshipId={friendshipId}
      onStatusUpdate={onStatusUpdate}
      onPersonRemove={onUserRemove}
      showActions={showActions}
      showRelationshipDate={false}
      identifier={user.username}
    />
  );
};

export default UserCard;
