import { NotFoundError } from "http-errors-enhanced";
import mongoose from "mongoose";
import { parseOrThrow } from "../../../utils/utils.js";
import Category from "../../category/model/category.js";
import type { TSubCategory } from "../interface/sub-category.js";
import SubCategory from "../model/sub-category.js";
import { createSubCategorySchema } from "../validation/sub-category.js";

const createSubCategory = async (payload: unknown) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const parsedData = parseOrThrow(createSubCategorySchema, payload);

    const result = await SubCategory.create([parsedData], { session });
    const updatedCategory = await Category.findByIdAndUpdate(
      parsedData.categoryId,
      {
        $push: {
          subCategories: result[0]?._id,
        },
      },
      {
        session,
        new: true,
      },
    );

    if (!updatedCategory) {
      throw new NotFoundError("Category not found!");
    }

    await session.commitTransaction();
  } catch (error: unknown) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getSubCategories = async (): Promise<TSubCategory[]> => {
  const result = await SubCategory.find({})
    .sort({ createdAt: -1, name: 1 })
    .populate("categoryId", "name");

  return result;
};

const subCategoryService = {
  createSubCategory,
  getSubCategories,
};

export default subCategoryService;
