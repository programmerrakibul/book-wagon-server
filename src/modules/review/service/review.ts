import type { TReviewDocument } from "@/review/interface/review.js";
import { Review } from "@/review/model/review.js";
import { reviewSchema } from "@/review/validation/review.js";
import { parseOrThrow, validateObjectId } from "@/utils/utils.js";
import type { TUserDocument } from "@/user/interface/user.js";
import { User } from "@/user/model/user.js";
import { NotFoundError } from "http-errors-enhanced";

const postReview = async (
  bookId: string,
  email: string,
  payload: unknown,
) => {
  if (!validateObjectId(bookId)) {
    throw new NotFoundError("Book not found!");
  }

  const parsedData = parseOrThrow(reviewSchema, payload);

  const user: TUserDocument | null = await User.findOne({ email });

  if (!user) {
    throw new NotFoundError("User not found!");
  }

  const { name, photoUrl } = user;

  let reviewDoc: TReviewDocument | null = await Review.findOne({ bookId });

  if (!reviewDoc) {
    reviewDoc = new Review({ bookId, reviews: [] });
  }

  const existingReviewIndex = reviewDoc.reviews.findIndex(
    (r) => r.customerEmail === email,
  );

  if (existingReviewIndex > -1) {
    const existingReview = reviewDoc.reviews[existingReviewIndex];
    if (existingReview) {
      existingReview.rating = parsedData.rating;
      existingReview.review = parsedData.review;
      existingReview.updatedAt = new Date();
    }
  } else {
    reviewDoc.reviews.push({
      customerEmail: email,
      customerName: name,
      customerImage: photoUrl,
      rating: parsedData.rating,
      review: parsedData.review,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await reviewDoc.save();
};

const getReviewsByBookId = async (bookId: string) => {
  if (!validateObjectId(bookId)) {
    throw new NotFoundError("Book not found!");
  }

  const result: TReviewDocument | null = await Review.findOne({ bookId });

  const reviews = result?.reviews.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return reviews || [];
};

const getBookRating = async (bookId: string) => {
  if (!validateObjectId(bookId)) {
    throw new NotFoundError("Book not found!");
  }

  const result: TReviewDocument | null = await Review.findOne({ bookId });

  if (!result || result.reviews.length === 0) {
    return { averageRating: 0, totalReviews: 0 };
  }

  const totalRating = result.reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = parseFloat(
    (totalRating / result.reviews.length).toFixed(1),
  );

  return {
    averageRating,
    totalReviews: result.reviews.length,
  };
};

const services = {
  postReview,
  getReviewsByBookId,
  getBookRating,
};

export default services;
