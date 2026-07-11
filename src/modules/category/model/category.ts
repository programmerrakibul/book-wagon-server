import { model, Schema } from "mongoose";
import type { TCategory } from "../interface/category.js";

const categorySchema = new Schema<TCategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    photoUrl: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    subCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: "SubCategory",
        index: true,
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "category",
  },
);

const Category = model<TCategory>("Category", categorySchema);

export default Category;
