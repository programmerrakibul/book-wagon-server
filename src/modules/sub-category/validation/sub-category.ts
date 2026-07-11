import { Types } from "mongoose";
import z from "zod";

export const createSubCategorySchema = z.object({
  name: z
    .string("Please provide a valid sub-category name!")
    .trim()
    .min(1, "Sub-category name is required!")
    .min(3, "Sub-category name must be at least 3 characters long")
    .max(100, "Sub-category name cannot exceed 100 characters"),

  categoryId: z
    .string("Please provide a valid category ID!")
    .trim()
    .min(1, "Category ID is required!")
    .refine((val) => {
      return Types.ObjectId.isValid(val);
    }, "Please provide a valid MongoDB ID!")
    .transform((val) => new Types.ObjectId(val)),

  photoUrl: z.url("Please provide a valid URL!").trim().lowercase().optional(),
});

export const updateSubCategorySchema = createSubCategorySchema.partial();
export type TCreateSubCategory = z.infer<typeof createSubCategorySchema>;
export type TUpdateSubCategory = z.infer<typeof updateSubCategorySchema>;
