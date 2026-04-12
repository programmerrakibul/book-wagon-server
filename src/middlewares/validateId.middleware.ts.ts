import { objectIdSchema } from "@/validators/objectId.validator.js";

import type { Request, Response, NextFunction } from "express";

export const validateId = (
  req: Request<{ id: string }>,
  _res: Response,
  next: NextFunction,
) => {
  const { success, data, error } = objectIdSchema.safeParse(req.params.id);

  if (!success) throw error;

  req.params.id = data;
  next();
};
