import z from "zod";

export const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(8000),
  MONGODB_URI: z
    .string("MongoDB URI is required!")
    .trim()
    .min(1, "MongoDB URI is required!")
    .startsWith("mongodb", "Must be a valid MongoDB connection string!"),
  DB_NAME: z.string().trim().default("book_wagon"),
  PAYMENT_GATEWAY_SECRET_KEY: z
    .string("Payment gateway secret key is required!")
    .trim()
    .min(1, "Payment gateway secret key is required!"),
  CLIENT_URL: z
    .string()
    .trim()
    .url("Must be a valid URL!")
    .default("http://localhost:5173"),
  FIREBASE_SERVICE_KEY: z
    .string("Firebase service key is required!")
    .trim()
    .min(1, "Firebase service key is required!"),
});
