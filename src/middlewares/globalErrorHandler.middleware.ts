import type { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors-enhanced";
import { ZodError } from "zod";
import type { TErrorResponse } from "../types/index.interface.js";
import { sendErrorResponse } from "../utils/sendResponse.js";
import { ApiError } from "../utils/utils.js";

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

  if (err instanceof HttpError) {
    message = err.message;
    statusCode = err.statusCode;
  }

  console.log("From global error: ", err);

  sendErrorResponse(res, statusCode, { message });
};
