import controllers from "@/comment/controller/comment.js";
import { validateId } from "@/middlewares/validate-id.js";
import { verifyTokenID } from "@/middlewares/verify-token.js";
import { Router } from "express";

const router = Router();

router.get("/:id", validateId, controllers.getCommentsByBookId);

router.post("/", verifyTokenID, controllers.createComment);

export default router;
