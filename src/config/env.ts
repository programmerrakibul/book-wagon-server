import { envSchema } from "@/validations/env.validator.js";
import { config } from "dotenv";
import { BadRequestError } from "http-errors-enhanced";

config();

const { success, data, error } = envSchema.safeParse(process.env);

if (!success) {
  const issues = Object.values(error.issues);
  const message = issues.map((iss) => iss.message).join(", ");
  throw new BadRequestError(message);
}

export const envConfig = data;
