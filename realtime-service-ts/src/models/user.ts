import type {UUID} from "node:crypto";


export class User{
    id: UUID;
    username: string;
    email: string;
    sessionId?: UUID;

    constructor(id: UUID, username: string, email: string, sessionId: UUID) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.sessionId = sessionId;
    }
}