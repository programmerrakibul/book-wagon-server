import { config } from "dotenv";

config();

export const envConfig = {
  PORT: Number(process.env.PORT) || 8000,
  MONGODB_URI: process.env.MONGODB_URI?.trim(),
  DB_NAME: process.env.DB_NAME?.trim() || "book_wagon",
  PAYMENT_GATEWAY_SECRET_KEY: process.env.PAYMENT_GATEWAY_SECRET_KEY?.trim(),
  CLIENT_URL: process.env.CLIENT_URL?.trim() || "http://localhost:5173",
  FIREBASE_SERVICE_KEY: process.env.FIREBASE_SERVICE_KEY?.trim(),
};
