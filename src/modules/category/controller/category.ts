import services from "@/category/service/category.js";
import { sendSuccessResponse } from "@/utils/sendResponse.js";
import type { Request, Response } from "express";
import status from "http-status";

const createCategory = async (req: Request, res: Response) => {
  await services.createCategory(req.body);

  sendSuccessResponse(res, status.CREATED, {
    message: "Category created successfully!",
  });
};

const getCategories = async (_req: Request, res: Response) => {
  const data = await services.getCategories();

  sendSuccessResponse(res, status.OK, {
    message: "Categories fetched successfully!",
    data,
  });
};

const controllers = { createCategory, getCategories };

export default controllers;
