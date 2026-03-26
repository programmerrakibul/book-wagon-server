const { User } = require("../models/User");

const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      const email = req.decoded_email;
      const user = await User.findOne({ email });

      roles = roles.map((role) => role?.toLowerCase());

      if (!user) throw new Error("Forbidden access");

      if (!roles.includes(user.role)) throw new Error("Forbidden access");

      next();
    } catch (error) {
      res.status(403).send({ success: false, message: "Forbidden access" });
    }
  };
};

module.exports = { authorize };
