import { envConfig } from "@/config/env.js";
import { connect, type ConnectOptions } from "mongoose";

const opt: ConnectOptions = {
  dbName: envConfig.DB_NAME,
  serverApi: {
    version: "1",
    strict: true,
    deprecationErrors: true,
  },
  bufferCommands: false,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
};

export const dbConnect = async () => {
  try {
    await connect(envConfig.MONGODB_URI, opt);
    console.log("✅ Database connected successfully!");
  } catch (err) {
    throw err;
  }
};
