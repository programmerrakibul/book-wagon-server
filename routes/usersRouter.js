const express = require("express");
const {
  postUser,
  getUsers,
  updateUserRole,
} = require("../controllers/usersController.js");

const usersRouter = express.Router();

usersRouter.get("/", getUsers);

usersRouter.post("/", postUser);

usersRouter.put("/:email/role", updateUserRole);

module.exports = { usersRouter };
