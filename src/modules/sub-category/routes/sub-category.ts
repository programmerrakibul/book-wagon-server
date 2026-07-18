import { authorize } from "@/middlewares/authorize.js";
import { verifyTokenID } from "@/middlewares/verify-token.js";
import controllers from "@/sub-category/controller/sub-category.js";
import { UserRole } from "@/user/validation/user.js";
import { Router } from "express";

const router = Router();

router.get("/", controllers.getSubCategories);
router.post(
  "/",
  verifyTokenID,
  authorize(UserRole.ADMIN),
  controllers.createSubCategory,
);

export default router;
