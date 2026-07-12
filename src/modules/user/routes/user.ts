import { authorize } from "@/middlewares/authorize.js";
import { validateData } from "@/middlewares/validateData.middleware.js";
import { verifyTokenID } from "@/middlewares/verify-token.js";
import {
  getUserRole,
  getUsers,
  postUser,
  updateUserRole,
} from "@/user/controller/user.js";
import { toggleRoleSchema, userSchema } from "@/user/validation/user.js";
import { Router } from "express";

export const usersRouter: Router = Router();

usersRouter.get("/", verifyTokenID, authorize("admin"), getUsers);

usersRouter.get("/role", verifyTokenID, getUserRole);

usersRouter.post("/", validateData(userSchema), postUser);

usersRouter.put(
  "/update-role",
  verifyTokenID,
  authorize("admin"),
  validateData(toggleRoleSchema),
  updateUserRole,
);
