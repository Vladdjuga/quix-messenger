export class RegisterUserDto {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    constructor(
        username: string,
        email: string,
        password: string,
        confirmPassword: string,
        firstName: string,
        lastName: string,
        dateOfBirth: Date
    ) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.confirmPassword = confirmPassword;
        this.firstName = firstName;
        this.lastName = lastName;
        this.dateOfBirth = dateOfBirth;
    }
}