import { Types, type Document } from "mongoose";
import type { TCreateCategory } from "../validation/category.js";

export interface TCategory extends Document, TCreateCategory {
  subCategories: (typeof Types.ObjectId)[];
}
