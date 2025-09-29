
export class ReadUserDto{
    id: string;
    avatarUrl: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    createdAt: Date;
    relationshipStatus?: number;
    friendshipId?: string;
    privateChatId?: string;

    constructor(
        id: string,
        avatarUrl: string,
        username: string,
        email: string,
        firstName: string,
        lastName: string,
        dateOfBirth: Date,
        createdAt: Date,
        relationshipStatus?: number,
        friendshipId?: string,
        privateChatId?: string
    ) {
        this.id = id;
        this.avatarUrl = avatarUrl;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.dateOfBirth = dateOfBirth;
        this.createdAt = createdAt;
        this.relationshipStatus = relationshipStatus;
        this.friendshipId = friendshipId;
        this.privateChatId = privateChatId;
    }
}