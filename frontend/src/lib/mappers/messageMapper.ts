import { ReadMessageDto } from "@/lib/dto/message/ReadMessageDto";
import { Message, MessageStatus } from "@/lib/types";
import { mapMessageAttachmentDtos } from "./attachmentMapper";

export function mapReadMessageDto(dto: ReadMessageDto): Message {
  return {
    id: dto.id,
    text: dto.text,
    userId: dto.userId,
    chatId: dto.chatId,
    status: (typeof dto.status === 'number' ? dto.status : dto.status) as MessageStatus,
    createdAt: new Date(dto.createdAt),
    attachments: mapMessageAttachmentDtos(dto.attachments || null)
  };
}

export function mapReadMessageDtos(dtos: ReadMessageDto[]): Message[] {
  return dtos.map(mapReadMessageDto);
}
