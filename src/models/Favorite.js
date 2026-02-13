const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    customerEmail: {
      type: String,
      required: [true, "Customer email is required"],
      trim: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Please provide a valid email address",
      },
    },
    bookIDs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: [true, "Book ID is required"],
        validate: {
          validator: function (v) {
            return mongoose.Types.ObjectId.isValid(v);
          },
          message: "Invalid Book ID format",
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

favoriteSchema.pre("save", async function () {
  this.updatedAt = new Date().toISOString();
});

const Favorite = mongoose.model("Favorite", favoriteSchema);

module.exports = { Favorite };
