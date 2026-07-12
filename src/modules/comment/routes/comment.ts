import { getComments, postComment } from "@/comment/controller/comment.js";
import { commentSchema } from "@/comment/validation/comment.js";
import { validateData } from "@/middlewares/validateData.middleware.js";
import { validateId } from "@/middlewares/validateId.middleware.ts.js";
import { verifyTokenID } from "@/middlewares/verify-token.js";
import { Router } from "express";

export const commentsRouter: Router = Router();

commentsRouter.get("/:id", validateId, getComments);

commentsRouter.post(
  "/:id",
  validateId,
  verifyTokenID,
  validateData(commentSchema),
  postComment,
);
