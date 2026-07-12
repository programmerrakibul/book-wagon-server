import { Router } from "express";
import {
  getUserRole,
  getUsers,
  postUser,
  updateUserRole,
} from "../controllers/users.controller.js";
import { authorize } from "../middlewares/authorize.js";
import { validateData } from "../middlewares/validateData.middleware.js";
import { verifyTokenID } from "../middlewares/verify-token.js";
import { toggleRoleSchema, userSchema } from "../validations/user.validator.js";

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
