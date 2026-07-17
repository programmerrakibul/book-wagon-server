import type { TSubCategory } from "@/sub-category/interface/sub-category.js";
import mongoose from "mongoose";

const schema = new mongoose.Schema<TSubCategory>(
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

    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
  },

  {
    timestamps: true,
    versionKey: false,
    collection: "SubCategory",
  },
);

schema.pre("save", function () {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, "-");
  }
});

const SubCategory = mongoose.model<TSubCategory>("SubCategory", schema);

export default SubCategory;
