import { authorize } from "@/middlewares/authorize.js";
import { validateId } from "@/middlewares/validate-id.js";
import { verifyTokenID } from "@/middlewares/verify-token.js";
import controllers from "@/user/controller/user.js";
import { UserRole } from "@/user/validation/user.js";
import { Router } from "express";

const ADMIN = UserRole.ADMIN;

const router: Router = Router();

router.get("/", verifyTokenID, authorize(ADMIN), controllers.getUsers);

router.get("/profile", verifyTokenID, controllers.getUserProfile);

router.patch("/profile", verifyTokenID, controllers.updateUserProfile);

router.get("/role", verifyTokenID, controllers.getUserRole);

router.post("/", controllers.postUser);

router.patch(
  "/role/:id",
  validateId,
  verifyTokenID,
  authorize(ADMIN),
  controllers.updateUserRole,
);

export default router;
