const express = require('express');
const { postBook, getBooks, getBookById } = require('../controllers/booksController.js');

const booksRouter = express.Router();

booksRouter.get('/', getBooks);

booksRouter.get('/:id', getBookById);

booksRouter.post('/', postBook);

module.exports = { booksRouter };