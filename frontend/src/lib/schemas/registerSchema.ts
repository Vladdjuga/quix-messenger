import { z } from "zod";

// Regex patterns matching backend validation
const usernameRegex = /^[a-zA-Z0-9_]{3,16}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#+\-_=])[A-Za-z\d@$!%*?&#+\-_=]{8,128}$/;
const nameRegex = /^[A-Z][a-zA-Z\-']{1,31}$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Schema that mirrors backend RegisterUserCommandValidator
export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(16, "Username must be at most 16 characters")
      .regex(usernameRegex, "Username can only contain letters, digits, and underscores"),
    email: z
      .string()
      .email("Invalid email address")
      .regex(emailRegex, "Email must be a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be at most 128 characters")
      .regex(
        passwordRegex,
        "Password must contain at least one uppercase letter, one lowercase letter, one digit, one special character, and no spaces"
      ),
    confirmPassword: z.string(),
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(32, "First name must be at most 32 characters")
      .regex(
        nameRegex,
        "First name must start with a capital letter and contain only letters, hyphens, or apostrophes"
      ),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(32, "Last name must be at most 32 characters")
      .regex(
        nameRegex,
        "Last name must start with a capital letter and contain only letters, hyphens, or apostrophes"
      ),
    // Accepts string or Date; coerces to Date instance
    dateOfBirth: z.coerce
      .date({ invalid_type_error: "Invalid date" })
      .min(new Date("1900-01-01"), "Date of birth must be after 1900-01-01")
      .max(new Date("2010-01-01"), "Date of birth must be before 2010-01-01"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
