const express = require("express");
const { postUser, getUsers } = require("../controllers/usersController.js");

const usersRouter = express.Router();

usersRouter.post("/", postUser);

usersRouter.get("/", getUsers);

module.exports = { usersRouter };
