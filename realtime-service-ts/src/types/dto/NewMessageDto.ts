import { IsDefined, IsString, IsUUID, MinLength } from "class-validator";

/**
 * @deprecated This DTO is no longer used.
 * Messages are now sent via HTTP to backend (POST /api/Messages)
 * Backend creates message + attachments atomically, then broadcasts via realtime-service
 * The WebSocket 'message' event has been removed.
 */
export class NewMessageDto {
  @IsDefined()
  @IsUUID()
  chatId!: string;

  @IsDefined()
  @IsString()
  @MinLength(1)
  text!: string;

  @IsDefined()
  @IsString()
  localId!: string;
}
