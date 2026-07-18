import type { TCreateComment } from "@/comment/validation/comment.js";
import type { Document, Types } from "mongoose";

export interface TComment extends Document, TCreateComment {
  userId: Types.ObjectId;
}
