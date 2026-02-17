const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    bookName: {
      type: String,
      required: [true, "Book name is required"],
      trim: true,
      minlength: [3, "Book name must be at least 3 characters long"],
      maxlength: [200, "Book name cannot exceed 200 characters"],
    },
    author: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
      minlength: [5, "Author name must be at least 5 characters long"],
      maxlength: [100, "Author name cannot exceed 100 characters"],
    },
    bookImage: {
      type: String,
      required: [true, "Book image URL is required"],
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
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      enum: {
        values: [
          "Fiction",
          "Non-Fiction",
          "Science",
          "History",
          "Biography",
          "Self-Help",
          "Technology",
          "Business",
          "Romance",
          "Mystery",
          "Fantasy",
          "Horror",
          "Other",
        ],
        message:
          "{VALUE} is not a valid category! Must be one of Fiction, Non-Fiction, Science, History, Biography, Self-Help, Technology, Business, Romance, Mystery, Fantasy, Horror, or Other",
      },
    },
    subcategory: {
      type: String,
      trim: true,
      maxlength: [100, "Subcategory cannot exceed 100 characters"],
      default: "General",
    },
    publicationYear: {
      type: Number,
      required: [true, "Publication year is required"],
      min: [1000, "Publication year must be at least 1000"],
      max: [
        new Date().getFullYear(),
        `Publication year cannot be in the future`,
      ],
      validate: {
        validator: Number.isInteger,
        message: "Publication year must be an integer",
      },
    },
    pageCount: {
      type: Number,
      required: [true, "Page count is required"],
      min: [1, "Page count must be at least 1"],
      max: [10000, "Page count cannot exceed 10,000"],
      validate: {
        validator: Number.isInteger,
        message: "Page count must be an integer",
      },
    },
    format: {
      type: String,
      required: [true, "Format is required"],
      trim: true,
      enum: {
        values: ["Hardcover", "Paperback", "eBook", "Audiobook"],
        message:
          "{VALUE} is not a valid format! Must be one of Hardcover, Paperback, eBook, or Audiobook",
      },
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
      max: [99999, "Quantity cannot exceed 99,999"],
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be an integer",
      },
      default: 1,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      max: [999999.99, "Price is too high"],
      set: (v) => parseFloat(v).toFixed(2),
      get: (v) => parseFloat(v).toFixed(2),
      validate: {
        validator: function (v) {
          return v >= 0 && v <= 999999.99;
        },
        message: "Please provide a valid price",
      },
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      trim: true,
      enum: {
        values: ["published", "unpublished"],
        message: "{VALUE} is not a valid status",
      },
      default: "unpublished",
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters long"],
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    librarianEmail: {
      type: String,
      required: [true, "Librarian email is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Please provide a valid email address",
      },
    },
  },
  {
    timestamps: true,
  },
);

bookSchema.pre("save", function () {
  const currentYear = new Date().getFullYear();
  if (this.publicationYear > currentYear) {
    throw new Error("Publication year cannot be in the future");
  }

  this.updatedAt = Date.now;
});

const Book = mongoose.model("Book", bookSchema);

module.exports = { Book };
