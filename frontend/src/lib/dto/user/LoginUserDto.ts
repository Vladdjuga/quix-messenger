export class LoginUserDto {
    // The identity can be either username or email
    // The password is always a string
    // This class is used to encapsulate the data required for user login
    constructor(
        public identity: string,
        public password: string
    ) {}
}