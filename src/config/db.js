const mongoose = require("mongoose");

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

const connectDB = async () => {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions);
    // await client.connect();

    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("You successfully connected to MongoDB!");
  } catch (err) {
    throw err;
  } finally {
    // Ensures that the client will close when you finish/error
    // await mongoose.disconnect();
  }
};

module.exports = { connectDB };
