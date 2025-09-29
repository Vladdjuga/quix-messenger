import { ReadUserDto } from "@/lib/dto/ReadUserDto";
import type { User } from "@/lib/types";
import { UserStatus } from "@/lib/types/enums";

export function mapReadUserDto(dto: ReadUserDto): User {
  return {
    id: dto.id,
    avatarUrl: dto.avatarUrl,
    username: dto.username,
    email: dto.email,
    firstName: dto.firstName,
    lastName: dto.lastName,
    dateOfBirth: new Date(dto.dateOfBirth),
    createdAt: new Date(dto.createdAt),
  relationshipStatus: mapRelationship(dto.relationshipStatus),
    friendshipId: dto.friendshipId,
    privateChatId: dto.privateChatId,
  };
}

export function mapReadUserDtos(dtos: ReadUserDto[]): User[] {
  return dtos.map(mapReadUserDto);
}

function mapRelationship(rel?: number): UserStatus | undefined {
  // Backend codes: None=0, PendingSent=1, PendingReceived=2, Friends=3, Blocked=4
  switch (rel) {
    case 3: return UserStatus.Friends;
    case 1: return UserStatus.PendingSent;
    case 2: return UserStatus.PendingReceived;
    case 4: return UserStatus.Blocked;
    case 0: return UserStatus.NotFriends;
    default: return undefined;
  }
}
