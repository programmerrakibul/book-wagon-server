const { Book } = require("../models/Book.js");
const { User } = require("../models/User.js");

const getBooks = async (req, res) => {
  const query = { status: "published" };
  let sortQuery = { createdAt: -1 };
  let projectionField = {};
  const {
    search,
    sortBy,
    sortOrder,
    email,
    limit = 10,
    skip = 0,
    fields,
    excludes,
    role,
    category,
  } = req.query;

  if (role === "admin" || role === "librarian") {
    delete query.status;
  }

  if (email) {
    query.librarianEmail = email;
  }

  if (category) {
    query.category = category;
  }

  if (search) {
    query["$or"] = [
      { bookName: { $regex: search, $options: "i" } },
      { author: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
    ];
  }

  if (sortBy?.trim()) {
    const order = sortOrder?.trim() === "desc" ? -1 : 1;
    sortQuery[sortBy?.trim()] = order;
  }

  if (fields) {
    fields.split(",").forEach((field) => {
      projectionField[field.trim()] = 1;
    });
  }

  if (excludes) {
    excludes.split(",").forEach((field) => {
      projectionField[field.trim()] = 0;
    });
  }

  if (Object.keys(projectionField).length === 0) {
    projectionField = null;
  }

  const options = {
    limit: JSON.parse(limit),
    skip: JSON.parse(skip),
    sort: sortQuery,
  };

  try {
    const books = await Book.find(query, projectionField, options);

    res.send({
      success: true,
      message: "Books data retrieved successfully",
      total: books.length || 0,
      books,
    });
  } catch (err) {
    console.log(err);

    res.status(500).send({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res
        .status(404)
        .send({ success: false, message: "Book not found" });
    }

    res.send({
      success: true,
      message: "Book data retrieved successfully",
      book,
    });
  } catch (err) {
    console.log(err);

    res.status(500).send({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

const postBook = async (req, res) => {
  try {
    const bookData = req.body;

    if (Object.keys(bookData || {}).length === 0) {
      return res.status(400).send({
        success: false,
        message: "Book data is required to post",
      });
    }

    await Book.create(bookData);

    res.status(201).send({
      success: true,
      message: "Book data posted successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).send({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

const updateBookById = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  if (Object.keys(updatedData || {}).length === 0) {
    return res
      .status(400)
      .send({ success: false, message: "No data provided for update" });
  }

  try {
    const isExist = await Book.findById(id);

    if (!isExist) {
      return res
        .status(404)
        .send({ success: false, message: "Book not found" });
    }

    await Book.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    res.send({
      success: true,
      message: "Book data updated successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).send({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

const deleteBookById = async (req, res) => {
  const { id } = req.params;

  try {
    const isExist = await Book.findById(id);

    if (!isExist) {
      return res
        .status(404)
        .send({ success: false, message: "Book data not found" });
    }

    await User.deleteMany({ bookId: id });
    await Book.findByIdAndDelete(id);

    res.send({
      success: true,
      message: "Book data deleted successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).send({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const result = await Book.find({}).select("category -_id");

    const categories = [...new Set(result.map((item) => item.category))].map(
      (cat, i) => ({ _id: i + 1, name: cat }),
    );

    res.send({
      success: true,
      message: "Categories data retrieved successfully",
      categories,
    });
  } catch (err) {
    console.log(err);

    res.status(500).send({ message: err.message || "Internal Server Error" });
  }
};

module.exports = {
  postBook,
  getBooks,
  getBookById,
  updateBookById,
  deleteBookById,
  getCategories,
};
