import {z} from 'zod';
import {ChatType} from "@/lib/types";

export const createChatSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
    chatType: z.coerce.number().pipe(z.nativeEnum(ChatType)),
});

export type CreateChatFormData = z.infer<typeof createChatSchema>;