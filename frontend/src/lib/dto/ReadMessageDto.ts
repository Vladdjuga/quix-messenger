import { MessageStatus } from "../types/enums";

// Transport shape: raw JSON from backend (dates as ISO strings)
export interface ReadMessageDto {
  id: string;
  text: string;
  userId: string;
  chatId: string;
  status: MessageStatus | number; // allow numeric flag if backend sends int
  sentAt: string; // ISO
}
