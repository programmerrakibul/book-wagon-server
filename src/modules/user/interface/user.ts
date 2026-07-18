import type { TCreateUser, TUserRole } from "@/user/validation/user.js";
import type { Document, PaginateModel, Types } from "mongoose";

export interface TUser extends Document, TCreateUser {
  books: Types.Array<Types.ObjectId>;
  orders: Types.Array<Types.ObjectId>;
  role: TUserRole;
  lastLoggedIn: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TUserModel extends PaginateModel<TUser> {
  toggleRole(query: string | Types.ObjectId, newRole: string): Promise<void>;
}
