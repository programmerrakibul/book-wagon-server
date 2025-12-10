const { ObjectId } = require("mongodb");
const { booksCollection } = require("../db.js");

const getBooks = async (req, res) => {
  const query = {};
  const sortQuery = {};
  let projectionField = {};
  const {
    search,
    sortBy,
    sortOrder,
    email,
    limit = 0,
    skip = 0,
    fields,
    excludes,
  } = req.query;

  if (email) {
    query.librarianEmail = email;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { "author.name": { $regex: search, $options: "i" } },
    ];
  }

  if (sortBy) {
    const order = sortOrder === "desc" ? -1 : 1;
    sortQuery[sortBy] = order;
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

  try {
    const books = await booksCollection
      .find(query)
      .limit(Number(limit))
      .skip(Number(skip))
      .sort(sortQuery)
      .project(projectionField)
      .toArray();

    const total = await booksCollection.countDocuments({});

    res.send({
      success: true,
      message: "Books data retrieved successfully",
      books,
      total,
    });
  } catch (err) {
    console.log(err);

    res.status(500).send({ message: "Internal Server Error" });
  }
};

const getBookById = async (req, res) => {
  const { id } = req.params;

  if (id.trim().length === 0) {
    return res.status(400).send({ message: "Book ID is required" });
  } else if (id.length !== 24) {
    return res.status(400).send({ message: "Invalid Book ID" });
  }

  const query = { _id: new ObjectId(id) };

  try {
    const book = await booksCollection.findOne(query);

    if (!book) {
      return res.status(404).send({ message: "Book not found" });
    }

    res.send({
      success: true,
      message: "Book data retrieved successfully",
      book,
    });
  } catch {
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const postBook = async (req, res) => {
  const bookData = req.body;
  const today = new Date().toISOString();
  bookData.createdAt = today;
  bookData.updatedAt = today;

  try {
    const result = await booksCollection.insertOne(bookData);

    res.status(201).send({
      success: true,
      message: "Book data posted successfully",
      ...result,
    });
  } catch {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

const updateBookById = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  if (id.trim().length === 0) {
    return res.status(400).send({ message: "Book ID is required" });
  } else if (id.trim().length !== 24) {
    return res.status(400).send({ message: "Invalid Book ID" });
  }

  if (!updatedData || Object.keys(updatedData).length === 0) {
    return res.status(400).send({ message: "No data provided for update" });
  }

  updatedData.updatedAt = new Date().toISOString();

  const query = { _id: new ObjectId(id) };

  try {
    const isExist = await booksCollection.findOne(query);

    if (!!isExist) {
      const result = await booksCollection.updateOne(query, {
        $set: updatedData,
      });

      res.send({
        success: true,
        message: "Book data updated successfully",
        ...result,
      });
    } else {
      return res.status(404).send({ message: "Book not found" });
    }
  } catch (err) {
    console.log(err);

    return res.status(500).send({ message: "Internal Server Error" });
  }
};

const deleteBookById = async (req, res) => {
  const { id } = req.params;

  if (id.trim().length === 0) {
    return res.status(400).send({ message: "Book ID is required" });
  } else if (id.trim().length !== 24) {
    return res.status(400).send({ message: "Invalid Book ID" });
  }

  const query = { _id: new ObjectId(id) };

  try {
    const isExist = await booksCollection.findOne(query);

    if (!!isExist) {
      const result = await booksCollection.deleteOne(query);

      res.send({
        success: true,
        message: "Book data deleted successfully",
        ...result,
      });
    } else {
      return res.status(404).send({ message: "Book data not found" });
    }
  } catch (err) {
    console.log(err);

    return res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports = {
  postBook,
  getBooks,
  getBookById,
  updateBookById,
  deleteBookById,
};
