import {
  paginationQuery,
  projectionQuery,
  searchQuery,
  sortQuery,
} from "@/lib/query.js";
import type { TUserRole } from "@/user/interface/user.js";
import z from "zod";

export const UserRole = {
  USER: "user",
  LIBRARIAN: "librarian",
  ADMIN: "admin",
} as const;

export const roleSchema = z
  .enum(
    Object.values(UserRole) as [TUserRole, ...TUserRole[]],
    "Role must be either user, librarian or admin!",
  )
  .transform((role) => role.toLowerCase());

export const userSchema = z.object({
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
  role: roleSchema.default("user"),
});

export const toggleRoleSchema = z.object({
  role: roleSchema,
  email: z
    .email("Please provide a valid email!")
    .transform((email) => email.toLowerCase().trim()),
});

export const userQuerySchema = z.object({
  ...paginationQuery,
  ...searchQuery,
  ...sortQuery,
  ...projectionQuery,
});
