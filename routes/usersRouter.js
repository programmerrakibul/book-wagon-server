const express = require("express");
const {
  postUser,
  getUsers,
  updateUserRole,
  getUserRole,
} = require("../controllers/usersController.js");
const { verifyTokenID } = require("../middlewares/verifyTokenID.js");

const usersRouter = express.Router();

usersRouter.use(verifyTokenID);

usersRouter.get("/", getUsers);

usersRouter.get("/:email/role", getUserRole);

usersRouter.post("/", postUser);

usersRouter.put("/:email/role", updateUserRole);

module.exports = { usersRouter };
