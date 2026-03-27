import { objectIdSchema } from "../validators/objectIdValidator.js";

export const validateId = (req, res, next) => {
  const { success, data, error } = objectIdSchema.safeParse(req.params.id);

  if (!success) throw error;

  req.params.id = data;
  next();
};
