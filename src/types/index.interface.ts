import type { CustomLabels } from "mongoose";

export interface TSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data?: T;
}

export interface TErrorResponse {
  success: false;
  message: string;
}

interface TPaginatedLabel extends CustomLabels<
  number | boolean | null | undefined
> {}

export interface TPaginatedResponse<T = unknown> extends Required<
  TSuccessResponse<T[]>
> {
  pagination: {
    totalDocs: TPaginatedLabel["totalDocs"];
    hasPrevPage: TPaginatedLabel["hasPrevPage"];
    hasNextPage: TPaginatedLabel["hasNextPage"];
    totalPages: TPaginatedLabel["totalPages"];
    page?: TPaginatedLabel["page"];
  };
}
export type TApiResponse<T = unknown> =
  | TSuccessResponse<T>
  | TPaginatedResponse<T>
  | TErrorResponse;
