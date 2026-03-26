export const globalErrorHandler = (err, req, res, next) => {
  let message = err.message || "Internal Server Error";
  let statusCode = err.statusCode || 500;

  if (err.name === "ZodError") {
    const issues = Object.values(err.issues);

    message = issues.map((iss) => iss.message).join(", ");
    statusCode = 400;
  }

  console.log("From global error: ", err);

  res.status(statusCode).send({ success: false, message });
};
