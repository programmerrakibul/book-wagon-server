import type { ZodSchema } from "zod";
import type { Request, Response, NextFunction } from "express";

export const validateData = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { success, data, error } = schema.safeParse(req.body);

    if (!success) throw error;

    req.body = data;
    next();
  };
};
