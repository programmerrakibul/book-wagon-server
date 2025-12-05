const express = require('express');
const { postBook, getBooks } = require('../controllers/booksController.js');

const booksRouter = express.Router();

booksRouter.get('/', getBooks);

booksRouter.post('/', postBook);

module.exports = { booksRouter };