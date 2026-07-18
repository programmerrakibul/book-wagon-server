import controllers from "@/book-format/controller/book-format.js";
import { authorize } from "@/middlewares/authorize.js";
import { verifyTokenID } from "@/middlewares/verify-token.js";
import { UserRole } from "@/user/validation/user.js";
import { Router } from "express";

const router = Router();

router.get("/", controllers.getBookFormats);
router.post(
  "/",
  verifyTokenID,
  authorize(UserRole.ADMIN),
  controllers.createBookFormat,
);

export default router;
