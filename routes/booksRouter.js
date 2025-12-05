const express = require('express');
const { postBook } = require('../controllers/booksController.js');

const booksRouter = express.Router();

booksRouter.post('/', postBook);

module.exports = { booksRouter };