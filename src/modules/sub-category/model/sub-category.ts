import mongoose from "mongoose";
import type { TSubCategory } from "../interface/sub-category.js";

const subCategorySchema = new mongoose.Schema<TSubCategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    categoryId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Category",
      index: true,
    },
    photoUrl: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "sub-category",
  },
);

const SubCategory = mongoose.model<TSubCategory>(
  "SubCategory",
  subCategorySchema,
);

export default SubCategory;
