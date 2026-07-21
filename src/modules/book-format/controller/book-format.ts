import services from "@/book-format/service/book-format.js";
import { sendSuccessResponse } from "@/utils/sendResponse.js";
import type { Request, Response } from "express";
import status from "http-status";

const createBookFormat = async (req: Request, res: Response) => {
  await services.createBookFormat(req.body);

  sendSuccessResponse(res, status.CREATED, {
    message: "Book format created successfully!",
  });
};

const getBookFormats = async (req: Request, res: Response) => {
  const data = await services.getBookFormats();

  sendSuccessResponse(res, status.OK, {
    message: "Book formats fetched successfully!",
    data,
  });
};

const controllers = {
  createBookFormat,
  getBookFormats,
};

export default controllers;
