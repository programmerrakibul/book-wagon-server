const mongoose = require("mongoose");
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || "book_wagon";

const clientOptions = {
  dbName: DB_NAME,
  serverApi: {
    version: "1",
    strict: true,
    deprecationErrors: true,
  },
};

if (!uri?.trim()) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

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

const connectDB = async () => {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await mongoose.disconnect();
  }
};

module.exports = {
  connectDB,
  client,
  usersCollection,
  booksCollection,
  ordersCollection,
  paymentsCollection,
  wishlistCollection,
  commentsCollection,
};
