import { model, Schema } from "mongoose";

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
      enum: ["admin", "librarian", "user"],
      default: "user",
    },
    lastLoggedIn: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.statics.getRole = async function (email) {
  try {
    const user = await this.findOne({ email });

    if (!user) {
      throw new Error("User not found!");
    }

    return user.role;
  } catch (error) {
    throw error;
  }
};

userSchema.statics.toggleRole = async function (email, newRole) {
  try {
    if (!["user", "librarian", "admin"].includes(newRole)) {
      throw new Error(
        "Invalid role! Role must be either 'user', 'librarian', or 'admin'.",
      );
    }

    const isExist = await this.findOne({ email });

    if (!isExist) {
      throw new Error("User not found!");
    }

    const result = await this.findByIdAndUpdate(
      isExist._id,
      { role: newRole },
      { new: true },
    );

    return result.toObject();
  } catch (error) {
    throw error;
  }
};

export const User = model("User", userSchema);
