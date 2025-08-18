import type {UUID} from "node:crypto";
import {IsDefined, IsString, IsUUID} from "class-validator";


export class User{

    @IsDefined()
    @IsUUID()
    id: UUID;

    @IsDefined()
    @IsString()
    username: string;

    @IsDefined()
    @IsString()
    email: string;

    @IsDefined()
    sessionId?: UUID;

    constructor(id: UUID, username: string, email: string, sessionId: UUID) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.sessionId = sessionId;
    }
}