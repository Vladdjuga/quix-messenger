export interface UpdateChatDto {
    chatId: string;
    title: string;
}

export interface RemoveUserFromChatDto {
    chatId: string;
    userId: string;
}

export interface ChatParticipantDto {
    userId: string;
    username: string;
    email: string;
    chatRole: number;
    avatarUrl?: string;
}
