import type {UUID} from "node:crypto";
import {IsString, IsDate, IsDefined, IsUUID, IsArray, IsOptional} from 'class-validator';
import type {MessageAttachmentDto} from './dto/MessageAttachmentDto.js';

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

    // Optional local ID to track messages before backend assigns real ID
    @IsString()
    localId?:string;

    // Optional attachments array
    @IsOptional()
    @IsArray()
    attachments?: MessageAttachmentDto[];

    constructor(
        id: UUID,
        createdAt: Date,
        text: string,
        userId: UUID,
        chatId: UUID,
        status: number,
        attachments?: MessageAttachmentDto[]
    ) {
        this.id = id;
        this.createdAt = createdAt;
        this.text = text;
        this.userId = userId;
        this.chatId = chatId;
        this.status = status;
        if (attachments !== undefined) {
            this.attachments = attachments;
        }
    }
}