import cors from "cors";
import express, { json } from "express";
import { dbConnect } from "./config/dbConnect.js";
import { envConfig } from "./config/envConfig.js";
import { booksRouter } from "./routes/booksRouter.js";
import { usersRouter } from "./routes/usersRouter.js";
import { ordersRouter } from "./routes/ordersRouter.js";
import { commentsRouter } from "./routes/commentsRouter.js";
import { paymentsRouter } from "./routes/paymentsRouter.js";
import { checkoutRouter } from "./routes/checkoutRouter.js";
import { dashboardRouter } from "./routes/dashboardRoutes.js";
import { favoritesRouter } from "./routes/favoritesRouter.js";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.js";

const app = express();
const port = envConfig.PORT;

// Middlewares
app.use(cors());
app.use(json());

const run = async () => {
  try {
    await dbConnect();

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

    app.use(globalErrorHandler);

    // Start the server
    app.listen(port, () => console.log("Server is running on port " + port));
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

run();
