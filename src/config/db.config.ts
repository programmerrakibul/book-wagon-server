import { connect, type ConnectOptions } from "mongoose";
import { envConfig } from "./env.config.js";

const opt: ConnectOptions = {
  dbName: envConfig.DB_NAME,
  serverApi: {
    version: "1",
    strict: true,
    deprecationErrors: true,
  },
  bufferCommands: false,
};

export const dbConnect = async () => {
  try {
    await connect(envConfig.MONGODB_URI, opt);
    console.log("Database connected successfully!");
  } catch (err) {
    throw err;
  }
};
