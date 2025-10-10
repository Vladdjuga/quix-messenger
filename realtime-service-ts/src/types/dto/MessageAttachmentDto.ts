// DTO for message attachments
// Only contains metadata and a URL to download the file
export interface MessageAttachmentDto {
    id: string;
    name: string;
    contentType: string;
    size: number;
    url: string;
}
