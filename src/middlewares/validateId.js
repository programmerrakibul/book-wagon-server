const mongoose = require("mongoose");

const validateId = (req, res, next) => {
  const id = req.params.id?.trim();

  if (!id) {
    return res.status(400).send({ success: false, message: "ID is required" });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ success: false, message: "Invalid ID" });
  }

  req.params.id = id;
  next();
};

module.exports = { validateId };
