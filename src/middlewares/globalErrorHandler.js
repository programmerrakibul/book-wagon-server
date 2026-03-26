const globalErrorHandler = (err, req, res, next) => {
  const message = err.message || "Internal Server Error";
  const statusCode = err.statusCode || 500;

  res.status(statusCode).send({ success: false, message });
};

module.exports = { globalErrorHandler };
