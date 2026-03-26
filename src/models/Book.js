import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    bookName: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    bookImage: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: [
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
    },
    subcategory: {
      type: String,
      trim: true,
      default: "General",
    },
    publicationYear: {
      type: Number,
      required: true,
    },
    pageCount: {
      type: Number,
      required: true,
    },
    format: {
      type: String,
      required: true,
      trim: true,
      enum: ["Hardcover", "Paperback", "eBook", "Audiobook"],
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    price: {
      type: Number,
      required: true,
      set: (v) => parseFloat(v).toFixed(2),
      get: (v) => parseFloat(v).toFixed(2),
    },
    status: {
      type: String,
      required: true,
      trim: true,
      enum: ["published", "unpublished"],
      default: "unpublished",
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    librarianEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
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
});

export const Book = mongoose.model("Book", bookSchema);
