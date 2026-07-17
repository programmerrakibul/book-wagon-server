import services from "@/favorite/service/favorite.js";
import { sendSuccessResponse } from "@/utils/sendResponse.js";
import type { Request, Response } from "express";
import status from "http-status";

const getFavoriteBooks = async (req: Request, res: Response) => {
  const { email: customerEmail } = req.user;
  const result = await services.getFavoriteBooks(customerEmail, req.query);

  sendSuccessResponse(res, status.OK, {
    message: "Favorite books data retrieved successfully!",
    ...result,
  });
};

const addToFavorite = async (req: Request<{ id: string }>, res: Response) => {
  const { id: bookId } = req.params;
  const { email: customerEmail } = req.user;

  await services.addToFavorite(bookId, customerEmail);

  sendSuccessResponse(res, status.CREATED, {
    message: "Book added to favorites successfully!",
  });
};

const checkInFavorites = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const { id: bookId } = req.params;
  const { email: customerEmail } = req.user;

  const result = await services.checkInFavorites(bookId, customerEmail);

  sendSuccessResponse(res, status.OK, {
    message: "Favorite status retrieved successfully!",
    data: result,
  });
};

const removeFromFavorites = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const { id: bookId } = req.params;
  const { email: customerEmail } = req.user;

  await services.removeFromFavorites(bookId, customerEmail);

  sendSuccessResponse(res, status.OK, {
    message: "Book successfully removed from favorites!",
  });
};

const controllers = {
  getFavoriteBooks,
  addToFavorite,
  checkInFavorites,
  removeFromFavorites,
};

export default controllers;
