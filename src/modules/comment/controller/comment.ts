import services from "@/comment/service/comment.js";
import { sendSuccessResponse } from "@/utils/sendResponse.js";
import type { Request, Response } from "express";
import status from "http-status";

const createComment = async (req: Request, res: Response) => {
  await services.createComment(req.user._id, req.body);

  sendSuccessResponse(res, status.CREATED, {
    message: "Comment posted successfully!",
  });
};

const getCommentsByBookId = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const result = await services.getCommentsByBookId(req.params.id, req.query);

  sendSuccessResponse(res, status.OK, {
    message: "Comments data retrieved successfully!",
    ...result,
  });
};

const controllers = {
  createComment,
  getCommentsByBookId,
};

export default controllers;
