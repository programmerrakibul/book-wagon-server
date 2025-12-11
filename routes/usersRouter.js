const express = require("express");
const {
  postUser,
  getUsers,
  updateUserRole,
  getUserRole,
} = require("../controllers/usersController.js");
const { verifyTokenID } = require("../middlewares/verifyTokenID.js");
const { verifyAdmin } = require("../middlewares/verifyAdmin.js");

const usersRouter = express.Router();

usersRouter.use(verifyTokenID);

usersRouter.get("/", verifyAdmin, getUsers);

usersRouter.get("/:email/role", getUserRole);

usersRouter.post("/", postUser);

usersRouter.put("/:email/role", verifyAdmin, updateUserRole);

module.exports = { usersRouter };
