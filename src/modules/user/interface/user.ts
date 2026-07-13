import type {
  toggleRoleSchema,
  userQuerySchema,
  UserRole,
  userSchema,
} from "@/user/validation/user.js";
import type { Document, PaginateModel, Types } from "mongoose";
import type z from "zod";

export type TCreateUser = z.infer<typeof userSchema>;
export interface TUserDocument extends Document, TCreateUser {
  books: Types.Array<Types.ObjectId>;
  orders: Types.Array<Types.ObjectId>;
  lastLoggedIn: Date;
}

export type TUserRole = (typeof UserRole)[keyof typeof UserRole];

export interface TUserModel extends PaginateModel<TUserDocument> {
  toggleRole(query: string | Types.ObjectId, newRole: string): Promise<void>;
  getRole(query: string | Types.ObjectId): Promise<string>;
}

export type TUserQuery = z.infer<typeof userQuerySchema>;
export type TToggleRole = z.infer<typeof toggleRoleSchema>;
