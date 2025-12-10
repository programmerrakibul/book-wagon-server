const { usersCollection } = require("../db.js");

const getUsers = async (req, res) => {
  const query = {};

  try {
    const users = await usersCollection.find(query).toArray();

    res.send({
      success: true,
      message: "Users data retrieved successfully",
      users,
    });
  } catch {
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const getUserRole = async (req, res) => {
  const { email } = req.params;

  if (email.trim().length === 0) {
    return res.status(400).send({ message: "Email is required" });
  }

  try {
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    res.send({ role: user.role });
  } catch (err) {
    console.log(err);

    res.status(500).send({ message: "Internal server error" });
  }
};

const postUser = async (req, res) => {
  const userData = req.body;
  const today = new Date().toISOString();
  const lastLoggedIn = today;
  userData.role = "user";
  userData.lastLoggedIn = lastLoggedIn;
  userData.createdAt = today;

  try {
    const isExist = await usersCollection.findOne({ email: userData.email });

    if (!!isExist) {
      await usersCollection.updateOne(
        { email: userData.email },
        { $set: { lastLoggedIn } }
      );

      return res.send({ message: "User with this email already exists" });
    }

    const result = await usersCollection.insertOne(userData);

    res.status(201).send({
      success: true,
      message: "User data posted successfully",
      ...result,
    });
  } catch {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

const updateUserRole = async (req, res) => {
  const { email } = req.params;
  const { role } = req.body;

  if (email.trim().length === 0) {
    return res.status(400).send({ message: "Email is required" });
  }

  if (role.trim().length === 0) {
    return res.status(400).send({ message: "Role is required" });
  }

  const query = { email };

  try {
    const isExist = await usersCollection.findOne(query);

    if (!isExist) {
      return res.status(404).send({ message: "User not found" });
    }

    const result = await usersCollection.updateOne(query, { $set: { role } });

    res.send({
      success: true,
      message: "User role updated successfully",
      ...result,
    });
  } catch {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports = { postUser, getUsers, updateUserRole, getUserRole };
