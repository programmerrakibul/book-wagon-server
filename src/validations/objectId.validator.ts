import z from "zod";
import { Types } from "mongoose";

export const objectIdSchema = z.custom<string>(
  (data) => Types.ObjectId.isValid(data as string),
  {
    error: (iss) => {
      return iss.input === undefined
        ? "Object ID is required!"
        : "Please provide a valid Object ID!";
    },
  },
);
