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
  ...paginationQuery,
  ...searchQuery,
  ...sortQuery,
  ...projectionQuery,
});
