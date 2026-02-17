const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Please provide a valid email address",
      },
    },
    photoURL: {
      type: String,
      trim: true,
      required: [true, "Photo URL is required"],
      validate: {
        validator: function (v) {
          return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(
            v,
          );
        },
        message: "Please provide a valid photo URL",
      },
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      trim: true,
      lowercase: true,
      enum: {
        values: ["admin", "librarian", "user"],
        message: "{VALUE} is not a valid role",
      },
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

userSchema.pre("save", function () {
  if (this.isNew) {
    this.updatedAt = Date.now;
  }
});

const User = mongoose.model("User", userSchema);

module.exports = { User };
