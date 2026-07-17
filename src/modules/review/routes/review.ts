import { validateId } from "@/middlewares/validate-id.js";
import { verifyTokenID } from "@/middlewares/verify-token.js";
import controllers from "@/review/controller/review.js";
import { Router } from "express";

export const reviewsRouter: Router = Router();

reviewsRouter.get("/book/:id", validateId, controllers.getReviewsByBookId);

reviewsRouter.get("/rating/:id", validateId, controllers.getBookRating);

reviewsRouter.post("/:id", validateId, verifyTokenID, controllers.postReview);
