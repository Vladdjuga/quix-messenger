import { ChatRole, ChatType } from "../types/enums";

export interface ReadChatDto {
    id: string;
    title: string;
    isPrivate: boolean;
    chatType: ChatType;
    isMuted: boolean;
    chatRole: ChatRole;
    createdAt: Date;
}


