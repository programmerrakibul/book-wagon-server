require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { client } = require("./db.js");
const { usersRouter } = require("./routes/usersRouter.js");
const { booksRouter } = require("./routes/booksRouter.js");
const { ordersRouter } = require("./routes/ordersRouter.js");
const { checkoutRouter } = require("./routes/checkoutRouter.js");
const { paymentsRouter } = require("./routes/paymentsRouter.js");

const app = express();
const port = process.env.PORT || 8000;

// Middlewares
app.use(cors());
app.use(express.json());

const run = async () => {
  try {
    await client.connect();

    app.get("/", (req, res) => {
      res.send("Welcome to the Book Wagon Server!");
    });

    app.use("/api/users", usersRouter);
    app.use("/api/books", booksRouter);
    app.use("/api/orders", ordersRouter);
    app.use("/api/checkout-session", checkoutRouter);
    app.use("/api/payments", paymentsRouter);

    await client.db("admin").command({ ping: 1 });

    console.log("Connected to MongoDB");

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port: ${port}`);
    });
  } finally {
    // await client.close();
  }
};

run().catch(console.dir);
