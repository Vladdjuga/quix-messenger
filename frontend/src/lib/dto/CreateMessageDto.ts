export interface CreateMessageDto {
  chatId: string; // or could be username if direct chat creation is implicit
  text: string;
}
