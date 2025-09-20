import type {UUID} from "node:crypto";
import {IsString, IsDate, IsDefined, IsUUID} from 'class-validator';

export class Message{

    @IsDefined()
    @IsUUID()
    id:UUID;

    @IsDefined()
    @IsDate()
    createdAt: Date;

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
        createdAt: Date,
        text: string,
        userId: UUID,
        chatId: UUID,
        status: number
    ) {
        this.id = id;
        this.createdAt = createdAt;
        this.text = text;
        this.userId = userId;
        this.chatId = chatId;
        this.status = status;
    }
}