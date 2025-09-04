import { FriendshipStatus } from "../types/enums";

export interface ReadFriendshipDto {
    id: string;
    username: string;
    email: string;
    dateOfBirth: Date;
    status: FriendshipStatus;
    privateChatId?: string;
    createdAt: Date;
}


