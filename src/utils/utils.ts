import type z from "zod";



export class ApiError extends Error {
  constructor(
    public statusCode: number = 500,
    public message: string = "An unexpected error occurred!",
  ) {
    super(message);
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string = "Bad request!") {
    super(400, message);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = "Resource not found!") {
    super(404, message);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = "Forbidden access!") {
    super(403, message);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = "Unauthorized access!") {
    super(401, message);
  }
}

export const parseOrThrow = <T>(schema: z.Schema<T>, payload: unknown): T => {
  return schema.parse(payload);
};



