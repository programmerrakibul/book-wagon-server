const express = require("express");
const {
  postUser,
  getUsers,
  updateUserRole,
  getUserRole,
} = require("../controllers/usersController.js");
const { verifyAdmin } = require("../middlewares/verifyAdmin.js");
const { verifyTokenID } = require("../middlewares/verifyTokenID.js");

const usersRouter = express.Router();

usersRouter.get("/", verifyTokenID, verifyAdmin, getUsers);

usersRouter.get("/:email/role", verifyTokenID, getUserRole);

usersRouter.post("/", postUser);

usersRouter.put("/:email/role", verifyTokenID, verifyAdmin, updateUserRole);

module.exports = { usersRouter };
