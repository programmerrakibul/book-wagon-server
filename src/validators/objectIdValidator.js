import z from "zod";
import { Types } from "mongoose";

export const objectIdSchema = z.custom((val) => Types.ObjectId.isValid(val), {
  error: (iss) => {
    return iss.input === undefined
      ? "Object ID is required!"
      : "Please provide a valid Object ID!";
  },
});
