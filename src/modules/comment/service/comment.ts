import type { TCommentDocument } from "@/comment/interface/comment.js";
import { Comment } from "@/comment/model/comment.js";
import { commentSchema } from "@/comment/validation/comment.js";
import { parseOrThrow, validateObjectId } from "@/utils/utils.js";
import type { TUserDocument } from "@/user/interface/user.js";
import { User } from "@/user/model/user.js";
import { NotFoundError } from "http-errors-enhanced";

const postComment = async (
  bookId: string,
  email: string,
  payload: unknown,
) => {
  const { comment } = parseOrThrow(commentSchema, payload);
  if (!validateObjectId(bookId)) {
    throw new NotFoundError("Book not found!");
  }

  const user: TUserDocument | null = await User.findOne({ email });

  if (!user) {
    throw new NotFoundError("User not found!");
  }

  const { name, photoUrl } = user;

  let commentDoc: TCommentDocument | null = await Comment.findOne({ bookId });

  if (!commentDoc) {
    commentDoc = new Comment({ bookId, comments: [] });
  }

  commentDoc.comments.push({
    customerEmail: email,
    customerName: name,
    customerImage: photoUrl,
    comment,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await commentDoc.save();
};

const getComments = async (bookId: string) => {
  if (!validateObjectId(bookId)) {
    throw new NotFoundError("Book not found!");
  }

  const result: TCommentDocument | null = await Comment.findOne({ bookId });

  const comments = result?.comments.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return comments || [];
};

const services = {
  postComment,
  getComments,
};

export default services;
