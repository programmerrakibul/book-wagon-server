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

const toggleFavorite = async (req: Request<{ id: string }>, res: Response) => {
  const result = await services.toggleFavorite(req.params.id, req.user._id);

  sendSuccessResponse(res, status.CREATED, {
    message: result,
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

const controllers = {
  getFavoriteBooks,
  toggleFavorite,
  checkInFavorites,
};

export default controllers;
