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

module.exports = { client, usersCollection, booksCollection };
