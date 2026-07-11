import type { TCategory } from "@/category/interface/category.js";
import Category from "@/category/model/category.js";
import { createCategorySchema } from "@/category/validation/category.js";
import { parseOrThrow } from "@/utils/utils.js";
import { ConflictError } from "http-errors-enhanced";

const createCategory = async (payload: unknown) => {
  const parsedData = parseOrThrow(createCategorySchema, payload);

  const existingCategory = await Category.findOne({
    name: {
      $regex: new RegExp(`^${parsedData.name}$`, "i"),
    },
  });

  if (existingCategory) {
    throw new ConflictError("Category already exists!");
  }

  await Category.create(parsedData);
};

const getCategories = async (): Promise<TCategory[]> => {
  const result = await Category.find({})
    .sort({ name: 1, createdAt: -1 })
    .populate("subCategories", "name");

  return result;
};

const categoryService = {
  createCategory,
  getCategories,
};

export default categoryService;
