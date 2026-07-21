import type { TPagination } from "@/utils/sendResponse.js";
import type { PaginateResult } from "mongoose";

type TCustomPaginateResponse<T> = {
  data: T[];
  pagination: TPagination;
};

export const getPaginatedData = <T>(
  result: PaginateResult<T>,
): TCustomPaginateResponse<T> => {
  const { docs, ...pagination } = result;

  return {
    data: docs,
    pagination: {
      totalDocs: pagination.totalDocs,
      hasPrevPage: pagination.hasPrevPage,
      hasNextPage: pagination.hasNextPage,
      totalPages: pagination.totalPages,
      page: pagination.page,
    },
  };
};
