export class ReadUserPublicDto {
    id: string;
    username: string;
    email: string;
    dateOfBirth: Date;

    constructor(
        id: string,
        username: string,
        email: string,
        dateOfBirth: Date
    ) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.dateOfBirth = dateOfBirth;
    }
}


