import { model, Schema } from "mongoose";

const commentSchema = new Schema(
  {
    bookId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Book",
      unique: true,
    },
    comments: [
      {
        customerEmail: {
          type: String,
          required: true,
          trim: true,
          lowercase: true,
        },
        customerName: {
          type: String,
          required: true,
          trim: true,
        },
        customerImage: {
          type: String,
          required: true,
          trim: true,
          lowercase: true,
        },
        comment: {
          type: String,
          required: true,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

commentSchema.statics.addByBookId = async function (bookId, commentData) {
  try {
    let commentDoc = await this.findOne({ bookId });

    if (!commentDoc) {
      commentDoc = new this({ bookId, comments: [] });
    }

    commentDoc.comments.push(commentData);
    return await commentDoc.save();
  } catch (error) {
    throw error;
  }
};

export const Comment = model("Comment", commentSchema);
