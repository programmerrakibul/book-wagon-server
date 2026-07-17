import services from "@/comment/service/comment.js";
import { sendSuccessResponse } from "@/utils/sendResponse.js";
import type { Request, Response } from "express";
import status from "http-status";

const postComment = async (req: Request<{ id: string }>, res: Response) => {
  const { email } = req.user;
  const { id: bookId } = req.params;

  await services.postComment(bookId, email, req.body);

  sendSuccessResponse(res, status.CREATED, {
    message: "Comment posted successfully!",
  });
};

const getComments = async (req: Request<{ id: string }>, res: Response) => {
  const { id: bookId } = req.params;
  const result = await services.getComments(bookId);

  sendSuccessResponse(res, status.OK, {
    message: "Comments data retrieved successfully!",
    data: result,
  });
};

const controllers = {
  postComment,
  getComments,
};

export default controllers;
