import {MessageAttachmentDto} from "@/lib/dto/message/MessageAttachmentDto";
import {MessageAttachment} from "@/lib/types";

function dtoAttachmentToDomain(dto: MessageAttachmentDto): MessageAttachment {
    return {
        id: dto.id,
        name: dto.name,
        url: dto.url,
        contentType: dto.contentType,
        size: dto.size,
    };
}
export function mapMessageAttachmentDtos(dtos: MessageAttachmentDto[] | null): MessageAttachment[] {
    if (!dtos) return [];
    return dtos.map(dtoAttachmentToDomain);
}
export function mapMessageAttachmentDto(dto: MessageAttachmentDto | null): MessageAttachment | null {
    if (!dto) return null;
    return dtoAttachmentToDomain(dto);
}