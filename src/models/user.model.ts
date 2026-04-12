import { model, Schema, type PaginateModel } from "mongoose";
import paginate from "mongoose-paginate-v2";
import { NotFoundError } from "../utils/utils.js";

import type {
  TUserDocument,
  TUserModel,
  TUserRole,
} from "../types/user.interface.js";
import { UserRole } from "../validators/user.validator.js";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    photoURL: {
      type: String,
      trim: true,
      required: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: Object.values(UserRole) as [TUserRole, ...TUserRole[]],
      default: UserRole.USER,
    },
    lastLoggedIn: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    timestamps: true,
  },
);

userSchema.statics.getRole = async function (email: string) {
  try {
    const user: TUserDocument | null = await this.findOne({ email });

    if (!user) {
      throw new NotFoundError("User not found!");
    }

    return user.role;
  } catch (error) {
    throw error;
  }
};

userSchema.statics.toggleRole = async function (
  email: string,
  newRole: string,
) {
  try {
    const user: TUserDocument | null = await this.findOne({ email });

    if (!user) {
      throw new NotFoundError("User not found!");
    }

    user.role = newRole;
    await user.save();
  } catch (error) {
    throw error;
  }
};

userSchema.plugin(paginate);

export const User = model<TUserDocument, TUserModel>("User", userSchema);
