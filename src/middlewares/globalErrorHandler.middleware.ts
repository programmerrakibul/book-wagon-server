import { ZodError } from "zod";
import { ApiError } from "@/utils/utils.js";

import type { Request, Response, NextFunction } from "express";
import type { TErrorResponse } from "@/types/index.interface.js";

export const globalErrorHandler = (
  err: unknown,
  _req: Request,
  res: Response<TErrorResponse>,
  _next: NextFunction,
) => {
  let message = "An unexpected error occurred!";
  let statusCode = 500;

  if (err instanceof ApiError) {
    message = err.message;
    statusCode = err.statusCode;
  }

  if (err instanceof ZodError) {
    const issues = Object.values(err.issues);

    message = issues.map((iss) => iss.message).join(", ");
    statusCode = 400;
  }

  console.log("From global error: ", err);

  res.status(statusCode).send({ success: false, message });
};
