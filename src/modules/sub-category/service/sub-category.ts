import Category from "@/category/model/category.js";
import type { TSubCategory } from "@/sub-category/interface/sub-category.js";
import SubCategory from "@/sub-category/model/sub-category.js";
import {
  createSubCategorySchema,
  querySchema,
} from "@/sub-category/validation/sub-category.js";
import { parseOrThrow, validateObjectId } from "@/utils/utils.js";
import { ConflictError, NotFoundError } from "http-errors-enhanced";
import mongoose from "mongoose";

const createSubCategory = async (payload: unknown) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const parsedData = parseOrThrow(createSubCategorySchema, payload);

    const parentCategory = await Category.findById(
      parsedData.categoryId,
    ).session(session);

    if (!parentCategory) {
      throw new NotFoundError("Parent Category not found!");
    }

    const existingSubCategory = await SubCategory.findOne({
      categoryId: parsedData.categoryId,
      name: {
        $regex: new RegExp(`^${parsedData.name}$`, "i"),
      },
    }).session(session);

    if (existingSubCategory) {
      throw new ConflictError("SubCategory already exists in this category!");
    }

    const existingSlugInSubCategory = await SubCategory.findOne({
      slug: parsedData.slug,
    }).session(session);

    if (existingSlugInSubCategory) {
      throw new ConflictError("SubCategory with this slug already exists!");
    }

    const [result] = await SubCategory.create([parsedData], { session });

    await Category.findByIdAndUpdate(
      parsedData.categoryId,
      {
        $push: {
          subCategories: result?._id,
        },
      },
      { session },
    );

    await session.commitTransaction();
  } catch (error: unknown) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getSubCategories = async (
  queryPayload: unknown,
): Promise<TSubCategory[]> => {
  const parsedData = parseOrThrow(querySchema, queryPayload);
  const categoryId = parsedData.categoryId;
  const query: Record<string, unknown> = {};

  if (typeof categoryId === "string") {
    if (!validateObjectId(categoryId)) return [];

    query.categoryId = categoryId;
  }

  const result = await SubCategory.find(query)
    .sort({ createdAt: -1, name: 1 })
    .populate("categoryId", "name slug");

  return result;
};

const services = {
  createSubCategory,
  getSubCategories,
};

export default services;
