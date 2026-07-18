import {
  paginationQuery,
  projectionQuery,
  searchQuery,
  sortQuery,
} from "@/lib/query.js";
import z from "zod";

export const UserRole = {
  USER: "USER",
  LIBRARIAN: "LIBRARIAN",
  ADMIN: "ADMIN",
} as const;

export const createUserSchema = z.object({
  name: z
    .string("Please provide a valid name!")
    .min(3, "Name must be at least 3 characters long!")
    .max(50, "Name cannot exceed 50 characters!"),

  email: z
    .email("Please provide a valid email!")
    .transform((email) => email.toLowerCase()),

  photoUrl: z
    .url("Please provide a valid URL!")
    .transform((url) => url.toLowerCase()),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(
    Object.values(UserRole) as [TUserRole, ...TUserRole[]],
    "Role must be either USER, LIBRARIAN or ADMIN!",
  ),
});

export const userQuerySchema = z.object({
  ...paginationQuery,
  ...searchQuery,
  ...sortQuery,
  ...projectionQuery,
});

export type TCreateUser = z.infer<typeof createUserSchema>;
export type TUserRole = (typeof UserRole)[keyof typeof UserRole];
