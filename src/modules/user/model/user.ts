import type {
  TUserDocument,
  TUserModel,
  TUserRole,
} from "@/user/interface/user.js";
import { UserRole } from "@/user/validation/user.js";
import { NotFoundError } from "http-errors-enhanced";
import { model, Schema } from "mongoose";
import paginate from "mongoose-paginate-v2";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    photoUrl: {
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
      index: true,
    },

    books: [
      {
        type: Schema.Types.ObjectId,
        ref: "Book",
        required: true,
        index: true,
      },
    ],

    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
        required: true,
        index: true,
      },
    ],

    lastLoggedIn: {
      type: Date,
      default: () => new Date(),
    },
  },

  {
    timestamps: true,
    collection: "User",
    versionKey: false,
  },
);

userSchema.statics.getRole = async function (
  query: string | Schema.Types.ObjectId,
) {
  const queryObj: Record<string, string | Schema.Types.ObjectId> = {};

  if (typeof query === "string") {
    queryObj.email = query;
  } else {
    queryObj._id = query;
  }

  const user: TUserDocument | null = await this.findOne(queryObj);

  if (!user) {
    throw new NotFoundError("User not found!");
  }

  return user.role;
};

userSchema.statics.toggleRole = async function (
  query: string | Schema.Types.ObjectId,
  newRole: string,
) {
  const queryObj: Record<string, string | Schema.Types.ObjectId> = {};

  if (typeof query === "string") {
    queryObj.email = query;
  } else {
    queryObj._id = query;
  }

  const user: TUserDocument | null = await this.findOne(queryObj);

  if (!user) {
    throw new NotFoundError("User not found!");
  }

  user.role = newRole;
  await user.save();
};

userSchema.plugin(paginate);

export const User = model<TUserDocument, TUserModel>("User", userSchema);
