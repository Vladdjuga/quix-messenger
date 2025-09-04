
export class ReadUserDto{
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    createdAt: Date;

    constructor(
        id: string,
        username: string,
        email: string,
        firstName: string,
        lastName: string,
        dateOfBirth: Date,
        createdAt: Date
    ) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.dateOfBirth = dateOfBirth;
        this.createdAt = createdAt;
    }
}