const express = require("express");
const { postUser } = require("../controllers/usersController.js");

const usersRouter = express.Router();

usersRouter.post("/", postUser);

module.exports = { usersRouter };
