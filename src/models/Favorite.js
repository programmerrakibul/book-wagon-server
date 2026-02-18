const mongoose = require("mongoose");
const { Book } = require("./Book");

const favoriteSchema = new mongoose.Schema(
  {
    customerEmail: {
      type: String,
      required: [true, "Customer email is required"],
      trim: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Please provide a valid email address",
      },
    },
    bookIDs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: [true, "Book ID is required"],
        validate: {
          validator: function (v) {
            return mongoose.Types.ObjectId.isValid(v);
          },
          message: "Invalid Book ID format",
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

favoriteSchema.statics.getFavoriteBooks = async function (customerEmail) {
  try {
    const favDoc = await this.findOne({ customerEmail });
    const bookIds = favDoc?.bookIDs || [];
    const favBooks = await Book.find({ _id: { $in: bookIds } }).sort({
      createdAt: -1,
    });

    return favBooks || [];
  } catch (error) {
    throw error;
  }
};

favoriteSchema.statics.addToFavorite = async function (customerEmail, bookId) {
  try {
    let favDoc = await this.findOne({ customerEmail });

    if (!favDoc) {
      favDoc = new this({ customerEmail, bookIDs: [] });
    }

    favDoc.bookIDs.addToSet(bookId);
    return await favDoc.save();
  } catch (error) {
    throw error;
  }
};

favoriteSchema.statics.removeFromFavorite = async function (
  customerEmail,
  bookId,
) {
  try {
    const result = await this.findOneAndUpdate(
      { customerEmail },
      {
        $pull: {
          bookIDs: bookId,
        },
      },
    );

    return result;
  } catch (error) {
    throw error;
  }
};

favoriteSchema.pre("save", async function () {
  this.updatedAt = Date.now;
});

const Favorite = mongoose.model("Favorite", favoriteSchema);

module.exports = { Favorite };
