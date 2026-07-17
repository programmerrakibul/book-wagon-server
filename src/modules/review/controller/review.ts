import services from "@/review/service/review.js";
import { sendSuccessResponse } from "@/utils/sendResponse.js";
import type { Request, Response } from "express";
import status from "http-status";

const postReview = async (req: Request<{ id: string }>, res: Response) => {
  const { email } = req.user;
  const { id: bookId } = req.params;

  await services.postReview(bookId, email, req.body);

  sendSuccessResponse(res, status.CREATED, {
    message: "Review posted successfully!",
  });
};

const getReviewsByBookId = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const { id: bookId } = req.params;
  const result = await services.getReviewsByBookId(bookId);

  sendSuccessResponse(res, status.OK, {
    message: "Reviews data retrieved successfully!",
    data: result,
  });
};

const getBookRating = async (req: Request<{ id: string }>, res: Response) => {
  const { id: bookId } = req.params;
  const result = await services.getBookRating(bookId);

  sendSuccessResponse(res, status.OK, {
    message: "Book rating retrieved successfully!",
    data: result,
  });
};

const controllers = {
  postReview,
  getReviewsByBookId,
  getBookRating,
};

export default controllers;
