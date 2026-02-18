const express = require("express");
const {
  postComment,
  getComments,
} = require("../controllers/commentsController.js");
const { verifyTokenID } = require("../middlewares/verifyTokenID.js");
const { validateId } = require("../middlewares/validateId.js");
const commentsRouter = express.Router();

commentsRouter.get("/:id", validateId, getComments);

commentsRouter.post("/", verifyTokenID, postComment);

module.exports = { commentsRouter };
