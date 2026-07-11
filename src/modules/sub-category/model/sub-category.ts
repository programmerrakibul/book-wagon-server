import type { TSubCategory } from "@/sub-category/interface/sub-category.js";
import mongoose from "mongoose";

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
