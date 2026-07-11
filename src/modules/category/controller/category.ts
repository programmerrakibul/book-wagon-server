import type { Request, Response } from "express";
import status from "http-status";
import { sendSuccessResponse } from "../../../utils/sendResponse.js";
import categoryService from "../service/category.js";

const createCategory = async (req: Request, res: Response) => {
  await categoryService.createCategory(req.body);

  sendSuccessResponse(res, status.CREATED, {
    message: "Category created successfully!",
  });
};

const getCategories = async (_req: Request, res: Response) => {
  const data = await categoryService.getCategories();

  sendSuccessResponse(res, status.OK, {
    message: "Categories fetched successfully!",
    data,
  });
};

const categoryController = { createCategory, getCategories };

export default categoryController;
