import type {UUID} from "node:crypto";

export class Message{
    id:UUID;
    sentAt: Date;
    receivedAt: Date;
    text: string;
    userId: UUID;
    chatId: UUID;
    status:number;
    constructor(
        id: UUID,
        sentAt: Date,
        receivedAt: Date,
        text: string,
        userId: UUID,
        chatId: UUID,
        status: number
    ) {
        this.id = id;
        this.sentAt = sentAt;
        this.receivedAt = receivedAt;
        this.text = text;
        this.userId = userId;
        this.chatId = chatId;
        this.status = status;
    }
}