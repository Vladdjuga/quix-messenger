import { ReadFriendshipDto } from "@/lib/dto/friendship/ReadFriendshipDto";
import type { Friendship, User } from "@/lib/types";

function dtoUserToDomain(dto: ReadFriendshipDto): User {
  return {
    id: dto.userId,
    avatarUrl: dto.avatarUrl,
    username: dto.username,
    email: dto.email,
    // ReadFriendshipDto doesn't carry first/last names; default to empty strings
    firstName: "",
    lastName: "",
    dateOfBirth: new Date(dto.dateOfBirth),
    createdAt: new Date(dto.createdAt),
  };
}

export function mapReadFriendshipDto(dto: ReadFriendshipDto): Friendship {
  return {
    id: dto.id,
    user: dtoUserToDomain(dto),
    status: dto.status,
    privateChatId: dto.privateChatId,
    createdAt: new Date(dto.createdAt),
  };
}

export function mapReadFriendshipDtos(dtos: ReadFriendshipDto[]): Friendship[] {
  return dtos.map(mapReadFriendshipDto);
}
