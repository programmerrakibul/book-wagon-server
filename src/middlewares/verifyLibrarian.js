const { User } = require("../models/User.js");

const verifyLibrarian = async (req, res, next) => {
  const email = req.decoded_email;

  try {
    const user = await User.findOne({ email });

    if (user?.role !== "librarian") {
      return res.status(403).send({
        success: false,
        message: "Forbidden access",
      });
    }

    next();
  } catch (err) {
    console.log(err);

    res.status(403).send({ success: false, message: "Forbidden access" });
  }
};

module.exports = { verifyLibrarian };
