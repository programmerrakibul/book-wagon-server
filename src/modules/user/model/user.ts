import type { TUser, TUserModel } from "@/user/interface/user.js";
import { UserRole, type TUserRole } from "@/user/validation/user.js";
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
      enum: Object.values(UserRole),
      default: UserRole.USER,
      index: true,
      uppercase: true,
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

userSchema.statics.toggleRole = async function (
  query: string | Schema.Types.ObjectId,
  newRole: TUserRole,
) {
  const queryObj: Record<string, string | Schema.Types.ObjectId> = {};

  if (typeof query === "string") {
    queryObj.email = query;
  } else {
    queryObj._id = query;
  }

  const user: TUser | null = await this.findOne(queryObj);

  if (!user) {
    throw new NotFoundError("User not found!");
  }

  user.role = newRole;
  await user.save();
};

userSchema.plugin(paginate);

const User = model<TUser, TUserModel>("User", userSchema);
export default User;
