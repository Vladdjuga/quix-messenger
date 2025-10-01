import {z} from 'zod';
import {ChatType} from "@/lib/types";

export const createChatSchema = z.object({
    title: z.string().min(1).max(100),
    chatType: z.nativeEnum(ChatType),
});

export type CreateChatFormData = z.infer<typeof createChatSchema>;