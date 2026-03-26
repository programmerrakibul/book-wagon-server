const mongoose = require("mongoose");
const { Comment } = require("../models/Comment.js");

const postComment = async (req, res, next) => {
  try {
    const { bookId, ...commentData } = req.body || {};

    if (!bookId?.trim() || !mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).send({
        success: false,
        message: "Valid book id is required",
      });
    }

    await Comment.addByBookId(bookId, commentData);

    res.status(201).send({
      success: true,
      message: "Comment posted successfully",
    });
  } catch (err) {
    next(err);
  }
};

const getComments = async (req, res, next) => {
  const { id } = req.params;

  const query = { bookId: id };
  try {
    const result = await Comment.findOne(query);
    const comments = result?.comments || [];

    res.send(comments);
  } catch (err) {
    next(err);
  }
};

module.exports = { postComment, getComments };
