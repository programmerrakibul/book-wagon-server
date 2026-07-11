import type { Response } from "express";

export type TSuccessResponse<T = unknown> = {
  success: true;
  message: string;
  data?: T;
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
