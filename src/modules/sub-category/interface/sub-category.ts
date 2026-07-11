import type { Document } from "mongoose";
import type { TCreateSubCategory } from "../validation/sub-category.js";

export interface TSubCategory extends Document, TCreateSubCategory {}
