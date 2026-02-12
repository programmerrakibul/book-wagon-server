const { ObjectId } = require("mongodb");
const { commentsCollection } = require("../db.js");

const postComment = async (req, res) => {
  const { comment, customerName, customerImage, customerEmail, bookId } =
    req.body;
  const createdAt = new Date().toISOString();

  if (
    !comment ||
    !customerEmail ||
    !customerImage ||
    !customerName ||
    !bookId
  ) {
    return res.status(400).send({
      message: "Customer name, email, image, comment and book id required!",
    });
  }

  try {
    const existingUser = await commentsCollection.findOne({
      bookId,
    });

    if (existingUser) {
      const result = await commentsCollection.updateOne(
        { _id: new ObjectId(existingUser._id) },
        {
          $push: {
            comments: {
              customerEmail,
              customerName,
              customerImage,
              comment,
              createdAt,
            },
          },
        }
      );

      return res.send({
        success: true,
        message: "Comment added to existing user",
        ...result,
      });
    } else {
      const newComment = {
        bookId,
        comments: [
          {
            customerEmail,
            customerName,
            customerImage,
            comment,
            createdAt,
          },
        ],
      };

      const result = await commentsCollection.insertOne(newComment);

      return res.send({
        success: true,
        message: "New user and comment created",
        ...result,
      });
    }
  } catch {
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

const getComments = async (req, res) => {
  const { bookId } = req.params;

  if (!bookId) {
    return res.status(400).send({ message: "Book id required" });
  }

  const query = { bookId };

  try {
    const result = await commentsCollection.findOne(query);
    const comments = result?.comments || [];

    res.send(comments);
  } catch {
    res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { postComment, getComments };
