import z from "zod";

export const createCategorySchema = z.object({
  name: z
    .string("Please provide a valid category name!")
    .trim()
    .min(1, "Category name is required!")
    .min(3, "Category name must be at least 3 characters long")
    .max(100, "Category name cannot exceed 100 characters"),

  photoUrl: z.url("Please provide a valid URL!").trim().lowercase().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type TCreateCategory = z.infer<typeof createCategorySchema>;
export type TUpdateCategory = z.infer<typeof updateCategorySchema>;
