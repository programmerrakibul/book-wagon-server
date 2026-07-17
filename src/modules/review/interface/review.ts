import type { reviewSchema } from "@/review/validation/review.js";
import type { Document, Types } from "mongoose";
import type z from "zod";

export interface TReviewDocument extends Document {
  bookId: Types.ObjectId;
  reviews: {
    customerEmail: string;
    customerName: string;
    customerImage: string;
    rating: number;
    review: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
}

export type TCreateReview = z.infer<typeof reviewSchema>;
