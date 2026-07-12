import type {
  toggleRoleSchema,
  userQuerySchema,
  UserRole,
  userSchema,
} from "@/user/validation/user.js";
import type { Document, PaginateModel } from "mongoose";
import type z from "zod";

export type TCreateUser = z.infer<typeof userSchema>;
export interface TUserDocument extends Document, TCreateUser {
  lastLoggedIn: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type TUserRole = (typeof UserRole)[keyof typeof UserRole];

export interface TUserModel extends PaginateModel<TUserDocument> {
  toggleRole(email: string, newRole: string): Promise<void>;
  getRole(email: string): Promise<string>;
}

export type TUserQuery = z.infer<typeof userQuerySchema>;
export type TToggleRole = z.infer<typeof toggleRoleSchema>;
