const mongoose = require("mongoose");
const { Favorite } = require("../models/Favorite.js");

const getFavoriteBooks = async (req, res) => {
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
    console.log(err);

    res.status(500).send({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

const addToFavorite = async (req, res) => {
  try {
    const email = req.params.email?.trim()?.toLowerCase();
    const bookId = req.body?.bookId?.trim();

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).send({
        success: false,
        message: "Invalid book id",
      });
    }

    await Favorite.addToFavorite(email, bookId);

    res.status(201).send({
      success: true,
      message: "Book id added to favorites successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).send({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

const checkInFavorites = async (req, res) => {
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
    console.log(err);

    res.status(500).send({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

const removeFromFavorites = async (req, res) => {
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
    console.log(err);

    res.status(500).send({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

module.exports = {
  getFavoriteBooks,
  addToFavorite,
  checkInFavorites,
  removeFromFavorites,
};
