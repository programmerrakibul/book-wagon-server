import { userQuerySchema } from "./user.validator.js";

export const paymentQuerySchema = userQuerySchema.omit({
  fields: true,
  excludes: true,
  search: true,
});
