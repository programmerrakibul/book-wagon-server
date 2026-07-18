import services from "@/favorite/service/favorite.js";
import { sendSuccessResponse } from "@/utils/sendResponse.js";
import type { Request, Response } from "express";
import status from "http-status";

const getFavoriteBooks = async (req: Request, res: Response) => {
  const result = await services.getFavoriteBooks(req.user._id, req.query);

  sendSuccessResponse(res, status.OK, {
    message: "Favorite books data retrieved successfully!",
    ...result,
  });
};

const addToFavorite = async (req: Request<{ id: string }>, res: Response) => {
  await services.addToFavorite(req.params.id, req.user._id);

  sendSuccessResponse(res, status.CREATED, {
    message: "Book added to favorites successfully!",
  });
};

const checkInFavorites = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const result = await services.checkInFavorites(req.params.id, req.user._id);

  sendSuccessResponse(res, status.OK, {
    message: "Favorite status retrieved successfully!",
    data: result,
  });
};

const removeFromFavorites = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  await services.removeFromFavorites(req.params.id, req.user._id);

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
