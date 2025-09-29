import { z } from "zod";

// Make the update schema align with register schema style:
// - Same fields and validation rules
// - Coerce dateOfBirth to a Date
// - Include confirmPassword and require it only when password is provided
const base = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.coerce.date({ invalid_type_error: "Invalid date" }),
});

export const updateUserSchema = base.partial();

export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
