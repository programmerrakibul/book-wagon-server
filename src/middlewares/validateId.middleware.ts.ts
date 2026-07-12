import type { NextFunction, Request, Response } from "express";
import { objectIdSchema } from "../validations/objectId.validator.js";

export const validateId = (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  const { success, data, error } = objectIdSchema.safeParse(req.params.id);

  if (!success) throw error;

  req.params.id = data;
  next();
};
