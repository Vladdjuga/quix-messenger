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

    // Static factory method
    static fromJson(json: unknown): User {
        if (typeof json !== "object" || json === null) {
            throw new Error("Invalid JSON: not an object");
        }

        const obj = json as Record<string, unknown>;

        const id = obj.sub;
        const username = obj.unique_name;
        const email = obj.email;
        const sessionId = obj.sessionId;

        if (typeof id !== "string") throw new Error("Invalid or missing 'sub'");
        if (typeof username !== "string") throw new Error("Invalid or missing 'unique_name'");
        if (typeof email !== "string") throw new Error("Invalid or missing 'email'");
        if (sessionId !== undefined && typeof sessionId !== "string") {
            throw new Error("Invalid 'sessionId'");
        }

        return new User(
            id as UUID,
            username,
            email,
            sessionId as UUID
        );
    }
}