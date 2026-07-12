import type { Response } from "express";
import type { CustomLabels } from "mongoose";

interface TPaginatedLabel extends CustomLabels<
  number | boolean | null | undefined
> {}

export type TSuccessResponse<T = unknown> = {
  success: true;
  message: string;
  data?: T;
  pagination?: {
    totalDocs: TPaginatedLabel["totalDocs"];
    hasPrevPage: TPaginatedLabel["hasPrevPage"];
    hasNextPage: TPaginatedLabel["hasNextPage"];
    totalPages: TPaginatedLabel["totalPages"];
    page?: TPaginatedLabel["page"];
  };
};

export type TErrorResponse = {
  success: false;
  message: string;
  errors?: unknown[];
};

export type TResponse<T = unknown> = TSuccessResponse<T> | TErrorResponse;

export const sendSuccessResponse = <T = unknown>(
  res: Response,
  statusCode: number,
  data: Omit<TSuccessResponse<T>, "success">,
) => {
  return sendResponse<T>(res, statusCode, {
    success: true,
    ...data,
  });
};

export const sendErrorResponse = (
  res: Response,
  statusCode: number,
  data: Omit<TErrorResponse, "success">,
) => {
  return sendResponse(res, statusCode, {
    success: false,
    ...data,
  });
};

export const sendResponse = <T = unknown>(
  res: Response,
  statusCode: number,
  data: TResponse<T>,
) => {
  return res.status(statusCode).send(data);
};
