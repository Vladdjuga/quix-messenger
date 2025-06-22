import {z} from "zod";

export const loginSchema = z.object({
    identity: z.string().min(1, "Username or email is required"),
    password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;