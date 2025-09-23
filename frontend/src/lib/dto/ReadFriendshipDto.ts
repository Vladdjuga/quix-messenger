import { FriendshipStatus } from "../types/enums";

export interface ReadFriendshipDto {
    id: string;
    userId: string;
    avatarUrl: string;
    username: string;
    email: string;
    dateOfBirth: Date;
    status: FriendshipStatus;
    privateChatId?: string;
    createdAt: Date;
}


