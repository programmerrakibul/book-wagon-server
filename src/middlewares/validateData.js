export const validateData = (schema) => {
  return (req, res, next) => {
    const { success, data, error } = schema.safeParse(req.body);

    if (!success) throw error;

    req.body = data;
    next();
  };
};
