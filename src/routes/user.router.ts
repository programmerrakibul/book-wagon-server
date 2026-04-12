import { Router } from "express";
import { verifyTokenID } from "../middlewares/verifyTokenID.middleware.js";
import {
  postUser,
  getUsers,
  updateUserRole,
  getUserRole,
} from "../controllers/users.controller.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { validateData } from "../middlewares/validateData.middleware.js";
import { userSchema, toggleRoleSchema } from "../validators/user.validator.js";

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
