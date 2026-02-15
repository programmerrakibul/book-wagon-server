const idValidator = (req, res, next) => {
  const id = req.params.id?.trim();

  if (!id) {
    return res.status(400).send({ success: false, message: "ID is required" });
  }

  if (typeof id !== "string" || id.length !== 24) {
    return res.status(400).send({ success: false, message: "Invalid ID" });
  }

  req.params.id = id;
  next();
};

module.exports = { idValidator };
