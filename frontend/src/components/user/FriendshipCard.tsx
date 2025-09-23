"use client";
import React from 'react';
import { ReadFriendshipDto } from '@/lib/dto/ReadFriendshipDto';
import { UserStatus } from '@/lib/types/enums';
import PersonCard, { friendshipToPersonData } from './PersonCard';

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
  return (
    <PersonCard
      person={friendshipToPersonData(friendship)}
      status={type}
      friendshipId={friendship.id}
      onStatusUpdate={(identifier, newStatus, friendshipId) => {
        if (newStatus === UserStatus.Friends && friendshipId) {
          onAccept?.(friendshipId);
        }
      }}
      onPersonRemove={onRemove}
      showActions={true}
      showRelationshipDate={true}
      identifier={friendship.id}
    />
  );
};

export default FriendshipCard;
