import { paginationQuery, sortQuery } from "@/lib/query.js";
import z from "zod";

export const paymentQuerySchema = z.object({
  ...paginationQuery,
  ...sortQuery,
});
