import type { TUserRole } from "@/types/user.interface.js";
import z, { ZodArray, ZodString } from "zod";

export const UserRole = {
  USER: "user",
  LIBRARIAN: "librarian",
  ADMIN: "admin",
} as const;

export const roleSchema = z
  .enum(Object.values(UserRole) as [TUserRole, ...TUserRole[]], {
    error: (iss) => {
      return iss.input === undefined
        ? "Role is required!"
        : "Role must be either 'user', 'librarian', or 'admin'.";
    },
  })
  .transform((role) => role.toLowerCase());

export const userSchema = z.object(
  {
    name: z
      .string({
        error: (iss) => {
          return iss.input === undefined
            ? "Name is required!"
            : "Provide a valid name!";
        },
      })
      .min(3, "Name must be at least 3 characters long!")
      .max(50, "Name cannot exceed 50 characters!"),
    email: z
      .email({
        error: (iss) => {
          return iss.input === undefined
            ? "Email is required!"
            : "Please provide a valid email address";
        },
      })
      .transform((email) => email.toLowerCase()),
    photoURL: z
      .url({
        error: (iss) => {
          return iss.input === undefined
            ? "Photo URL is required!"
            : "Please provide a valid photo URL!";
        },
      })
      .transform((url) => url.toLowerCase()),
    role: roleSchema.default("user"),
  },
  "User data is required in the request body!",
);

export const toggleRoleSchema = z.object({
  role: roleSchema,
  email: z
    .email({
      error: (iss) => {
        return iss.input === undefined
          ? "Email is required!"
          : "Please provide a valid email address!";
      },
    })
    .transform((email) => email.toLowerCase().trim()),
});

export const userQuerySchema = z.object({
  page: z
    .string()
    .trim()
    .transform((val) => Number(val) || 1)
    .optional(),
  limit: z
    .string()
    .trim()
    .transform((val) => Number(val) || 10)
    .optional(),
  search: z
    .string()
    .transform((val) => val.trim())
    .optional(),
  sortBy: z.string().trim().optional(),
  sortOrder: z
    .string()
    .transform((val) => val.trim().toLowerCase())
    .optional(),
  fields: z
    .preprocess<string[], ZodArray<ZodString>, string>((val) => {
      return val.split(",").map((field) => field.trim());
    }, z.array(z.string()))
    .optional(),
  excludes: z
    .preprocess<string[], ZodArray<ZodString>, string>((val) => {
      return val.split(",").map((field) => field.trim());
    }, z.array(z.string()))
    .optional(),
});
