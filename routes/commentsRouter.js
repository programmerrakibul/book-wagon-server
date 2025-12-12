const express = require("express");
const {
  postComment,
  getComments,
} = require("../controllers/commentsController.js");
const { verifyTokenID } = require("../middlewares/verifyTokenID.js");
const commentsRouter = express.Router();

commentsRouter.get("/:bookId", getComments);

commentsRouter.post("/", verifyTokenID, postComment);

module.exports = { commentsRouter };
