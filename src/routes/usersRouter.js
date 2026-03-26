import express from "express";
import { verifyTokenID } from "../middlewares/verifyTokenID.js";
import {
  postUser,
  getUsers,
  updateUserRole,
  getUserRole,
} from "../controllers/usersController.js";
import { authorize } from "../middlewares/authorize.js";
import { validateData } from "../middlewares/validateData.js";
import { userSchema } from "../validators/userValidator.js";

export const usersRouter = express.Router();

usersRouter.get("/", verifyTokenID, authorize("admin"), getUsers);

usersRouter.get("/:email/role", verifyTokenID, getUserRole);

usersRouter.post("/", validateData(userSchema), postUser);

usersRouter.put(
  "/:email/role",
  verifyTokenID,
  authorize("admin"),
  updateUserRole,
);
