import { Favorite } from "@/models/favorite.model.js";

import type { TBookDocument, TBookQuery } from "@/types/book.interface.js";
import type { TFavoriteDocument } from "@/types/favorite.interface.js";
import type { Request, Response, NextFunction } from "express";
import type {
  TPaginatedResponse,
  TSuccessResponse,
} from "@/types/index.interface.js";

export const getFavoriteBooks = async (
  req: Request<{}, {}, {}, TBookQuery>,
  res: Response<TPaginatedResponse<TBookDocument>>,
  next: NextFunction,
) => {
  try {
    const { docs, ...pagination } = await Favorite.getFavoriteBooks(
      req.user.email,
      req.query,
    );

    res.send({
      success: true,
      message: "Favorite books data retrieved successfully",
      data: docs,
      pagination: {
        totalDocs: pagination.totalDocs,
        hasNextPage: pagination.hasNextPage,
        hasPrevPage: pagination.hasPrevPage,
        totalPages: pagination.totalPages,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const addToFavorite = async (
  req: Request<{ id: string }>,
  res: Response<TSuccessResponse>,
  next: NextFunction,
) => {
  try {
    const { id: bookId } = req.params;
    const { email: customerEmail } = req.user;

    let favDoc: TFavoriteDocument | null = await Favorite.findOne({
      customerEmail,
    });

    if (!favDoc) {
      favDoc = new Favorite({ customerEmail, bookIDs: [] });
    }

    favDoc.bookIDs.addToSet(bookId);

    await favDoc.save();

    res.status(201).send({
      success: true,
      message: "Book added to favorites successfully!",
    });
  } catch (err) {
    next(err);
  }
};

export const checkInFavorites = async (
  req: Request<{ id: string }>,
  res: Response<TSuccessResponse<boolean>>,
  next: NextFunction,
) => {
  try {
    const { user, params } = req;

    const query = {
      customerEmail: user.email,
      bookIDs: params.id,
    };

    const result: TFavoriteDocument | null = await Favorite.findOne(query);

    res.send({
      success: true,
      message: "Favorite status retrieved successfully!",
      data: Boolean(result),
    });
  } catch (err) {
    next(err);
  }
};

export const removeFromFavorites = async (
  req: Request<{ id: string }>,
  res: Response<TSuccessResponse>,
  next: NextFunction,
) => {
  try {
    const { id: bookId } = req.params;
    const { email: customerEmail } = req.user;

    await Favorite.findOneAndUpdate(
      { customerEmail },
      {
        $pull: {
          bookIDs: bookId,
        },
      },
    );

    res.send({
      success: true,
      message: "Book successfully removed from favorites!",
    });
  } catch (err) {
    next(err);
  }
};
