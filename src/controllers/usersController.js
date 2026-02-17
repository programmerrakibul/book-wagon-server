const { User } = require("../models/User.js");

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });

    res.send({
      success: true,
      message: "Users data retrieved successfully",
      total: users.length || 0,
      users,
    });
  } catch (err) {
    console.log(err);

    res.status(500).send({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

const getUserRole = async (req, res) => {
  try {
    const email = req.params.email?.trim()?.toLowerCase();

    if (email.length === 0) {
      return res
        .status(400)
        .send({ success: false, message: "Email is required" });
    }

    const role = await User.getRole(email);

    res.send({
      success: true,
      message: "User role retrieved successfully",
      role,
    });
  } catch (err) {
    console.log(err);

    res.status(err.statusCode || 500).send({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

const postUser = async (req, res) => {
  const userData = req.body;

  try {
    if (Object.keys(userData || {}).length === 0) {
      return res.status(400).send({
        success: false,
        message: "User data is required in request body",
      });
    }

    const isExist = await User.findOne({ email: userData.email });

    if (!!isExist) {
      await User.findByIdAndUpdate(
        isExist._id,
        { lastLoggedIn: Date.now() },
        { new: false },
      );

      return res.send({
        success: true,
        message: "User with this email already exists",
      });
    }

    await User.create(userData);

    res.status(201).send({
      success: true,
      message: "User data posted successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).send({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

const updateUserRole = async (req, res) => {
  const email = req.params.email?.trim()?.toLowerCase();
  const role = req.body?.role?.trim()?.toLowerCase();

  if (!email) {
    return res
      .status(400)
      .send({ success: false, message: "Email is required" });
  }

  if (!role) {
    return res
      .status(400)
      .send({ success: false, message: "Role is required" });
  }

  try {
    const result = await User.toggleRole(email, role);

    res.send({
      success: true,
      message: "User role updated successfully",
      result,
    });
  } catch (err) {
    console.log(err);

    res.status(500).send({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

module.exports = { postUser, getUsers, updateUserRole, getUserRole };
