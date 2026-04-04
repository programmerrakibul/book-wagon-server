import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";

import type { Request, Response, NextFunction } from "express";
import type { TUserDocument } from "../types/user.interface.js";
import type { TSuccessResponse } from "../types/index.interface.js";
import type { TCommentDocument } from "../types/comment.interface.js";

export const postComment = async (
  req: Request<{ id: string }, {}, { comment: string }>,
  res: Response<TSuccessResponse>,
  next: NextFunction,
) => {
  try {
    const { email } = req.user;
    const { comment } = req.body;
    const { id: bookId } = req.params;

    const user: TUserDocument | null = await User.findOne({ email });

    if (!user) {
      throw new Error("User not found!");
    }

    const { name, photoURL } = user;

    let commentDoc: TCommentDocument | null = await Comment.findOne({ bookId });

    if (!commentDoc) {
      commentDoc = new Comment({ bookId, comments: [] });
    }

    commentDoc.comments.push({
      customerEmail: email,
      customerName: name,
      customerImage: photoURL,
      comment,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await commentDoc.save();

    res.status(201).send({
      success: true,
      message: "Comment posted successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const getComments = async (
  req: Request<{ id: string }>,
  res: Response<TSuccessResponse>,
  next: NextFunction,
) => {
  try {
    const { id: bookId } = req.params;

    const result: TCommentDocument | null = await Comment.findOne({ bookId });

    const comments = result?.comments.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    res.send({
      success: true,
      message: "Comments data retrieved successfully!",
      data: comments,
    });
  } catch (err) {
    next(err);
  }
};
