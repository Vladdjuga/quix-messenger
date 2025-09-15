import { ReadMessageDto } from "@/lib/dto/ReadMessageDto";
import { Message, MessageStatus } from "@/lib/types";

export function mapReadMessageDto(dto: ReadMessageDto): Message {
  return {
    id: dto.id,
    text: dto.text,
    userId: dto.userId,
    chatId: dto.chatId,
    status: (typeof dto.status === 'number' ? dto.status : dto.status) as MessageStatus,
    sentAt: new Date(dto.sentAt),
    receivedAt: new Date(dto.receivedAt)
  };
}

export function mapReadMessageDtos(dtos: ReadMessageDto[]): Message[] {
  return dtos.map(mapReadMessageDto);
}
