import {z} from "zod";

// Schema matching backend LoginUserCommandValidator
export const loginSchema = z.object({
    identity: z
        .string()
        .min(1, "Username or email is required"),
    password: z
        .string()
        .min(8, "Password must contain at least 8 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;