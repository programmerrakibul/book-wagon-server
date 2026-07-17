import controllers from "@/comment/controller/comment.js";
import { validateId } from "@/middlewares/validate-id.js";
import { verifyTokenID } from "@/middlewares/verify-token.js";
import { Router } from "express";

export const commentsRouter: Router = Router();

commentsRouter.get("/:id", validateId, controllers.getComments);

commentsRouter.post(
  "/:id",
  validateId,
  verifyTokenID,
  controllers.postComment,
);
