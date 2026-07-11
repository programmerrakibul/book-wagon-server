import type { TCreateCategory } from "@/category/validation/category.js";
import { Types, type Document } from "mongoose";

export interface TCategory extends Document, TCreateCategory {
  subCategories: (typeof Types.ObjectId)[];
}
