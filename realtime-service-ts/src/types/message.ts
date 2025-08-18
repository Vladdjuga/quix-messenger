import type {UUID} from "node:crypto";
import {IsString, IsDate, IsDefined, IsUUID} from 'class-validator';

export class Message{

    @IsDefined()
    @IsUUID()
    id:UUID;

    @IsDefined()
    @IsDate()
    sentAt: Date;

    @IsDefined()
    @IsDate()
    receivedAt: Date;

    @IsDefined()
    @IsString()
    text: string;

    @IsDefined()
    @IsUUID()
    userId: UUID;

    @IsDefined()
    @IsUUID()
    chatId: UUID;

    @IsDefined()
    @IsString()
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