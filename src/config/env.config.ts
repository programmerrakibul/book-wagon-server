import { config } from "dotenv";
import { BadRequestError } from "../utils/utils.js";
import { envSchema } from "../validators/env.validator.js";

config();

const { success, data, error } = envSchema.safeParse(process.env);

if (!success) {
  const issues = Object.values(error.issues);
  const message = issues.map((iss) => iss.message).join(", ");
  throw new BadRequestError(message);
}

export const envConfig = data;
