import { Favorite } from "../models/Favorite.js";

export const getFavoriteBooks = async (req, res, next) => {
  try {
    const email = req.params.email?.trim()?.toLowerCase();

    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Email is required",
      });
    }

    const books = await Favorite.getFavoriteBooks(email);

    res.send({
      success: true,
      message: "Favorite books data retrieved successfully",
      total: books.length,
      books,
    });
  } catch (err) {
    next(err);
  }
};

export const addToFavorite = async (req, res, next) => {
  try {
    const email = req.decoded_email;
    const { bookId } = req.body;

    await Favorite.addToFavorite(email, bookId);

    res.status(201).send({
      success: true,
      message: "Book id added to favorites successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const checkInFavorites = async (req, res, next) => {
  try {
    const { email, id } = req.params;

    if (!email?.trim()) {
      return res
        .status(400)
        .send({ success: false, message: "Email is required" });
    }

    const query = {
      customerEmail: email,
      bookIDs: id,
    };

    const user = await Favorite.findOne(query);

    res.send({
      success: true,
      inWishlist: Boolean(user),
    });
  } catch (err) {
    next(err);
  }
};

export const removeFromFavorites = async (req, res, next) => {
  try {
    const { email, id } = req.params;

    if (!email?.trim()) {
      return res
        .status(400)
        .send({ success: false, message: "Email is required" });
    }

    await Favorite.removeFromFavorite(email, id);

    res.send({
      success: true,
      message: "Book removed from favorites successfully",
    });
  } catch (err) {
    next(err);
  }
};
