const express = require("express");
const {
  postComment,
  getComments,
} = require("../controllers/commentsController.js");
const { verifyTokenID } = require("../middlewares/verifyTokenID.js");
const { idValidator } = require("../middlewares/IdValidator.js");
const commentsRouter = express.Router();

commentsRouter.get("/:id", idValidator, getComments);

commentsRouter.post("/", verifyTokenID, postComment);

module.exports = { commentsRouter };
