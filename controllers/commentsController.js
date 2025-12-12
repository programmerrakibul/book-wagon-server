const { ObjectId } = require("mongodb");
const { commentsCollection } = require("../db.js");

const postComment = async (req, res) => {
  const { comment, customerName, customerImage, customerEmail, bookId } =
    req.body;
  const today = new Date().toISOString();
  const createdAt = today;
  const updatedAt = today;

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
      customerEmail,
    });

    if (existingUser) {
      const result = await commentsCollection.updateOne(
        { _id: new ObjectId(existingUser._id) },
        {
          $push: {
            comments: {
              bookId,
              comment,
              createdAt,
            },
          },
          $set: { updatedAt },
        }
      );

      return res.send({
        success: true,
        message: "Comment added to existing user",
        ...result,
      });
    } else {
      const newComment = {
        customerEmail,
        customerName,
        customerImage,
        createdAt,
        updatedAt,
        comments: [
          {
            bookId,
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
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

module.exports = { postComment };
