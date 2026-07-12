import { transformToObjectId, validateObjectId } from "@/utils/utils.js";
import z from "zod";

export const createSubCategorySchema = z
  .object({
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
        return validateObjectId(val);
      }, "Please provide a valid MongoDB ID!")
      .transform((val) => transformToObjectId(val)),

    photoUrl: z
      .url("Please provide a valid URL!")
      .trim()
      .toLowerCase()
      .optional(),

    slug: z
      .string("Please provide a valid slug!")
      .trim()
      .toLowerCase()
      .transform((val) => val.replace(/\s+/g, "-"))
      .optional(),
  })
  .transform((data) => ({
    ...data,
    slug: data.slug || data.name.toLowerCase().replace(/\s+/g, "-"),
  }));

export type TCreateSubCategory = z.infer<typeof createSubCategorySchema>;
