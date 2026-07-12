import { sendErrorResponse } from "@/utils/sendResponse.js";
import type { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors-enhanced";
import status from "http-status";
import { ZodError } from "zod";

export const globalErrorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let message = "An unexpected error occurred!";
  let statusCode = status.INTERNAL_SERVER_ERROR as number;

  if (err instanceof ZodError) {
    const issues = Object.values(err.issues);

    message = issues.map((iss) => iss.message).join(", ");
    statusCode = status.UNPROCESSABLE_ENTITY as number;
  }

  if (err instanceof HttpError) {
    message = err.message;
    statusCode = err.statusCode;
  }

  console.log("From global error: ", err);

  sendErrorResponse(res, statusCode, { message });
};
