import { Router } from "express";
import {
  getComments,
  postComment,
} from "../controllers/comments.controller.js";
import { validateData } from "../middlewares/validateData.middleware.js";
import { validateId } from "../middlewares/validateId.middleware.ts.js";
import { verifyTokenID } from "../middlewares/verify-token.js";
import { commentSchema } from "../validations/comment.validator.js";

export const commentsRouter: Router = Router();

commentsRouter.get("/:id", validateId, getComments);

commentsRouter.post(
  "/:id",
  validateId,
  verifyTokenID,
  validateData(commentSchema),
  postComment,
);
