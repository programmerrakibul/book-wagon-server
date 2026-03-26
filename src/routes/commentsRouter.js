import { Router } from "express";
import { validateId } from "../middlewares/validateId.js";
import { validateData } from "../middlewares/validateData.js";
import { verifyTokenID } from "../middlewares/verifyTokenID.js";
import { commentSchema } from "../validators/commentValidator.js";
import { postComment, getComments } from "../controllers/commentsController.js";

export const commentsRouter = Router();

commentsRouter.get("/:id", validateId, getComments);

commentsRouter.post(
  "/",
  verifyTokenID,
  validateData(commentSchema),
  postComment,
);
