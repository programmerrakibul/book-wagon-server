import services from "@/book/service/book.js";
import { sendSuccessResponse } from "@/utils/sendResponse.js";
import type { Request, Response } from "express";
import status from "http-status";

const getBooks = async (req: Request, res: Response) => {
  const result = await services.getBooks(req.query);

  sendSuccessResponse(res, status.OK, {
    message: "Books data fetched successfully",
    ...result,
  });
};

const getBookById = async (req: Request<{ id: string }>, res: Response) => {
  const result = await services.getBookById(req.params.id);

  sendSuccessResponse(res, status.OK, {
    message: "Book data fetched successfully",
    data: result,
  });
};

const createBook = async (req: Request, res: Response) => {
  const { _id } = req.user;
  await services.createBook(req.body, _id);

  sendSuccessResponse(res, status.CREATED, {
    message: "Book created successfully!",
  });
};

const updateBookById = async (req: Request<{ id: string }>, res: Response) => {
  await services.updateBookById(req.params.id, req.body);

  sendSuccessResponse(res, status.OK, {
    message: "Book data updated successfully!",
  });
};

const deleteBookById = async (req: Request<{ id: string }>, res: Response) => {
  await services.deleteBookById(req.params.id);

  sendSuccessResponse(res, status.OK, {
    message: "Book data deleted successfully!",
  });
};

const controllers = {
  createBook,
  getBooks,
  getBookById,
  updateBookById,
  deleteBookById,
};
export default controllers;
