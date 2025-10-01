import { ChatType } from "@/lib/types";

export interface CreateChatDto {
    title?: string;
    chatType: ChatType;
    // participantIds: string[]; Can be added later when implementing group chats
}