import { ReadUserDto } from "@/lib/dto/ReadUserDto";
import type { User } from "@/lib/types";

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
  };
}

export function mapReadUserDtos(dtos: ReadUserDto[]): User[] {
  return dtos.map(mapReadUserDto);
}
