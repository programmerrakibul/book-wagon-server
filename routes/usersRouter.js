const express = require("express");
const {
  postUser,
  getUsers,
  updateUserRole,
  getUserRole,
} = require("../controllers/usersController.js");

const usersRouter = express.Router();

usersRouter.get("/", getUsers);

usersRouter.get("/:email/role", getUserRole);

usersRouter.post("/", postUser);

usersRouter.put("/:email/role", updateUserRole);

module.exports = { usersRouter };
