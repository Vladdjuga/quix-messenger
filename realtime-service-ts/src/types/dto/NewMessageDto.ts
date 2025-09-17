import { IsDefined, IsString, IsUUID, MinLength } from "class-validator";

export class NewMessageDto {
  @IsDefined()
  @IsUUID()
  chatId!: string;

  @IsDefined()
  @IsString()
  @MinLength(1)
  text!: string;
}
