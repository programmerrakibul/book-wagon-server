import controllers from "@/user/controller/user.js";
import { authorize } from "@/middlewares/authorize.js";
import { verifyTokenID } from "@/middlewares/verify-token.js";
import { Router } from "express";

export const usersRouter: Router = Router();

usersRouter.get("/", verifyTokenID, authorize("admin"), controllers.getUsers);

usersRouter.get("/role", verifyTokenID, controllers.getUserRole);

usersRouter.post("/", controllers.postUser);

usersRouter.put(
  "/update-role",
  verifyTokenID,
  authorize("admin"),
  controllers.updateUserRole,
);
