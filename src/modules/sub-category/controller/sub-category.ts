import categoryService from "@/modules/sub-category/service/sub-category.js";
import { sendSuccessResponse } from "@/utils/sendResponse.js";
import type { Request, Response } from "express";
import status from "http-status";

const createSubCategory = async (req: Request, res: Response) => {
  await categoryService.createSubCategory(req.body);

  sendSuccessResponse(res, status.CREATED, {
    message: "SubCategory created successfully!",
  });
};

const getSubCategories = async (_req: Request, res: Response) => {
  const data = await categoryService.getSubCategories();

  sendSuccessResponse(res, status.OK, {
    message: "SubCategories fetched successfully!",
    data,
  });
};

const subCategoryController = {
  createSubCategory,
  getSubCategories,
};

export default subCategoryController;
