import type { TCreateSubCategory } from "@/sub-category/validation/sub-category.js";
import type { Document } from "mongoose";

export interface TSubCategory extends Document, TCreateSubCategory {}
