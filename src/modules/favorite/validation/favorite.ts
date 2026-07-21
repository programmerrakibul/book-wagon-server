import { paginationQuery, searchQuery, sortQuery } from "@/lib/query.js";
import z from "zod";

export const favoriteQuerySchema = z.object({
  ...paginationQuery,
  ...searchQuery,
  ...sortQuery,
});
