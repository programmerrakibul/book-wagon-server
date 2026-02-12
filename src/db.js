const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const database = client.db("book_wagon");
const usersCollection = database.collection("users");
const booksCollection = database.collection("books");
const ordersCollection = database.collection("orders");
const paymentsCollection = database.collection("payments");
const wishlistCollection = database.collection("wishlist");
const commentsCollection = database.collection("comments");

module.exports = {
  client,
  usersCollection,
  booksCollection,
  ordersCollection,
  paymentsCollection,
  wishlistCollection,
  commentsCollection,
};
