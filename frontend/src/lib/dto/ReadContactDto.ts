import { ContactStatus } from "../types/enums";

export interface ReadContactDto {
    id: string;
    username: string;
    email: string;
    dateOfBirth: Date;
    status: ContactStatus;
    privateChatId?: string;
    createdAt: Date;
}


