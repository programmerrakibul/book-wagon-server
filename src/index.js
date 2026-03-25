const express = require("express");
const cors = require("cors");

const { connectDB } = require("./config/db.js");
const { usersRouter } = require("./routes/usersRouter.js");
const { booksRouter } = require("./routes/booksRouter.js");
const { ordersRouter } = require("./routes/ordersRouter.js");
const { checkoutRouter } = require("./routes/checkoutRouter.js");
const { paymentsRouter } = require("./routes/paymentsRouter.js");
const { favoritesRouter } = require("./routes/favoritesRouter.js");
const { commentsRouter } = require("./routes/commentsRouter.js");
const { dashboardRouter } = require("./routes/dashboardRoutes.js");
const { envConfig } = require("./config/env.js");

const app = express();
const port = envConfig.PORT;

// Middlewares
app.use(cors());
app.use(express.json());

const run = async () => {
  try {
    await connectDB();

    app.get("/", (req, res) => {
      res.send({ success: true, message: "Welcome to the Book Wagon Server!" });
    });

    app.use("/api/users", usersRouter);
    app.use("/api/books", booksRouter);
    app.use("/api/orders", ordersRouter);
    app.use("/api/checkout-session", checkoutRouter);
    app.use("/api/payments", paymentsRouter);
    app.use("/api/wishlist", favoritesRouter);
    app.use("/api/comments", commentsRouter);
    app.use("/api/dashboard", dashboardRouter);

    app.use((req, res) => {
      res.status(404).send({
        success: false,
        message: "Endpoint Not Found",
      });
    });

    // Start the server
    app.listen(port, () => console.log("Server is running on port " + port));
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

run();
