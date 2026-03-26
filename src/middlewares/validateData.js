export const validateData = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) throw result.error;

    req.body = result.data;
    next();
  };
};
