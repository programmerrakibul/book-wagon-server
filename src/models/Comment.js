const mongoose = require("mongoose");

const today = new Date().toISOString();

const commentSchema = new mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Book ID is required"],
      ref: "Book",
      validate: {
        validator: function (v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: "Invalid Book ID format",
      },
    },
    comments: [
      {
        customerEmail: {
          type: String,
          required: [true, "Customer email is required"],
          trim: true,
          lowercase: true,
          validate: {
            validator: function (v) {
              return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: "Please provide a valid email address",
          },
        },
        customerName: {
          type: String,
          required: [true, "Customer name is required"],
          trim: true,
          minlength: [3, "Name must be at least 3 characters long"],
          maxlength: [50, "Name cannot exceed 50 characters"],
        },
        customerImage: {
          type: String,
          required: [true, "Customer image is required"],
          trim: true,
          validate: {
            validator: function (v) {
              return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(
                v,
              );
            },
            message: "Please provide a valid image URL",
          },
        },
        comment: {
          type: String,
          required: [true, "Comment is required"],
          trim: true,
          minlength: [1, "Comment cannot be empty"],
          maxlength: [1000, "Comment cannot exceed 1000 characters"],
        },
        createdAt: {
          type: Date,
          default: today,
        },
        updatedAt: {
          type: Date,
          default: today,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

commentSchema.pre("save", function () {
  this.updatedAt = today;
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = { Comment };
