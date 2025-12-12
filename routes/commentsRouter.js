const express = require("express");
const {
  postComment,
  getComments,
} = require("../controllers/commentsController.js");
const commentsRouter = express.Router();

commentsRouter.get("/:bookId", getComments);

commentsRouter.post("/", postComment);

module.exports = { commentsRouter };
