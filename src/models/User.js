const mongoose = require("mongoose");

const today = new Date().toISOString();

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
      default: today,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", function () {
  this.updatedAt = today;
  this.lastLoggedIn = today;
});

const User = mongoose.model("User", userSchema);

module.exports = { User };
