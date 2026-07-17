import { validateObjectId } from "@/utils/utils.js";
import z from "zod";

export const objectIdSchema = z.custom<string>(
  (data) => validateObjectId(data as string),
  {
    error: (iss) => {
      return iss.input === undefined
        ? "Object ID is required!"
        : "Please provide a valid Object ID!";
    },
  },
);
