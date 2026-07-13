import type { TCreateCategory } from "@/category/validation/category.js";
import { Types, type Document } from "mongoose";

export interface TCategory extends Document, TCreateCategory {
  subCategories: Types.Array<Types.ObjectId>;
}
