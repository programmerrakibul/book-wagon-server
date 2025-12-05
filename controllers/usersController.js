const { usersCollection } = require("../db.js");

const postUser = async (req, res) => {
  const userData = req.body;
  const today = new Date().toISOString();
  const lastLoggedIn = today;
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
      message: "User created successfully",
      ...result,
    });
  } catch {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports = { postUser };
