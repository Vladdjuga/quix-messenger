export class UpdateUserDto {
  username?: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date | string;

  constructor(init?: Partial<UpdateUserDto>) {
    Object.assign(this, init);
  }
}
