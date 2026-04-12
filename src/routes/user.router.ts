import { Router } from "express";
import { authorize } from "@/middlewares/authorize.middleware.js";
import { validateData } from "@/middlewares/validateData.middleware.js";
import { verifyTokenID } from "@/middlewares/verifyTokenID.middleware.js";
import { toggleRoleSchema, userSchema } from "@/validators/user.validator.js";
import {
  getUserRole,
  getUsers,
  postUser,
  updateUserRole,
} from "@/controllers/users.controller.js";

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
