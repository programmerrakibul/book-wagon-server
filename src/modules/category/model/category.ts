import type { TCategory } from "@/category/interface/category.js";
import { model, Schema } from "mongoose";

const schema = new Schema<TCategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
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
      unique: true,
      lowercase: true,
      index: true,
    },

    subCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: "SubCategory",
        index: true,
        required: true,
      },
    ],
  },

  {
    timestamps: true,
    versionKey: false,
    collection: "Category",
  },
);

schema.pre("save", function () {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, "-");
  }
});

const Category = model<TCategory>("Category", schema);

export default Category;
