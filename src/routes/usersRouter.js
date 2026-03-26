const express = require("express");
const { verifyTokenID } = require("../middlewares/verifyTokenID.js");
const {
  postUser,
  getUsers,
  updateUserRole,
  getUserRole,
} = require("../controllers/usersController.js");
const { authorize } = require("../middlewares/authorize.js");

const usersRouter = express.Router();

usersRouter.get("/", verifyTokenID, authorize("admin"), getUsers);

usersRouter.get("/:email/role", verifyTokenID, getUserRole);

usersRouter.post("/", postUser);

usersRouter.put(
  "/:email/role",
  verifyTokenID,
  authorize("admin"),
  updateUserRole,
);

module.exports = { usersRouter };
