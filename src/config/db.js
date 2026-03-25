const mongoose = require("mongoose");
const { envConfig } = require("./env");

const uri = envConfig.MONGODB_URI;
const DB_NAME = envConfig.DB_NAME;

const clientOptions = {
  dbName: DB_NAME,
  serverApi: {
    version: "1",
    strict: true,
    deprecationErrors: true,
  },
};

if (!uri) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

const connectDB = async () => {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions);

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
