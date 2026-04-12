import { Router } from "express";
import { validateData } from "@/middlewares/validateData.middleware.js";
import { validateId } from "@/middlewares/validateId.middleware.ts.js";
import { verifyTokenID } from "@/middlewares/verifyTokenID.middleware.js";
import { commentSchema } from "@/validators/comment.validator.js";
import { getComments, postComment } from "@/controllers/comments.controller.js";

export const commentsRouter: Router = Router();

commentsRouter.get("/:id", validateId, getComments);

commentsRouter.post(
  "/:id",
  validateId,
  verifyTokenID,
  validateData(commentSchema),
  postComment,
);
