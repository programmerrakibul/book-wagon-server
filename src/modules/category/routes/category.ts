import controllers from "@/category/controller/category.js";
import { authorize } from "@/middlewares/authorize.js";
import { verifyTokenID } from "@/middlewares/verify-token.js";
import { UserRole } from "@/user/validation/user.js";
import { Router } from "express";

const router = Router();

router.get("/", controllers.getCategories);
router.post(
  "/",
  verifyTokenID,
  authorize(UserRole.ADMIN),
  controllers.createCategory,
);

export default router;
