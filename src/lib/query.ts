import z, { ZodArray, ZodString } from "zod";

export const paginationQuery = {
  page: z
    .string()
    .trim()
    .transform((val) => Number(val) || 1)
    .optional(),

  limit: z
    .string()
    .trim()
    .transform((val) => Number(val) || 10)
    .optional(),
};

export const searchQuery = {
  search: z
    .string()
    .transform((val) => val.trim())
    .optional(),
};

export const sortQuery = {
  sortBy: z.string().trim().optional(),

  sortOrder: z
    .string()
    .transform((val) => val.trim().toLowerCase())
    .optional(),
};

export const projectionQuery = {
  fields: z
    .preprocess<string[], ZodArray<ZodString>, string>((val) => {
      return val.split(",").map((field) => field.trim());
    }, z.array(z.string()))
    .optional(),

  excludes: z
    .preprocess<string[], ZodArray<ZodString>, string>((val) => {
      return val.split(",").map((field) => field.trim());
    }, z.array(z.string()))
    .optional(),
};
