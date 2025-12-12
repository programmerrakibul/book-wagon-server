const express = require("express");
const { postComment } = require("../controllers/commentsController.js");
const commentsRouter = express.Router();

commentsRouter.post("/", postComment);

module.exports = { commentsRouter };
