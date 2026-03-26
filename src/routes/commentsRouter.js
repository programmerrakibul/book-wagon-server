import express from "express";
import { postComment, getComments } from "../controllers/commentsController.js";
import { verifyTokenID } from "../middlewares/verifyTokenID.js";
import { validateId } from "../middlewares/validateId.js";

export const commentsRouter = express.Router();

commentsRouter.get("/:id", validateId, getComments);

commentsRouter.post("/", verifyTokenID, postComment);
