import cors from "cors";
import express, { json } from "express";
import { dbConnect } from "./config/db.config.js";
import { envConfig } from "./config/env.config.js";
import { usersRouter } from "./routes/user.router.js";
import { booksRouter } from "./routes/book.router.js";
import { ordersRouter } from "./routes/order.router.js";
import { paymentsRouter } from "./routes/payment.router.js";
import { checkoutRouter } from "./routes/checkout.router.js";
import { commentsRouter } from "./routes/comment.router.js";
import { dashboardRouter } from "./routes/dashboard.router.js";
import { favoritesRouter } from "./routes/favorite.router.js";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.middleware.js";

import type { Request, Response } from "express";
import type { TSuccessResponse } from "./types/index.interface.js";
import { BadRequestError } from "./utils/utils.js";

const app = express();
const port = envConfig.PORT;

// Middlewares
app.use(cors());
app.use(json());

const run = async () => {
  try {
    await dbConnect();

    app.get("/", (req: Request, res: Response<TSuccessResponse>) => {
      res.send({ success: true, message: "Welcome to the Book Wagon Server!" });
    });

    app.use("/api/users", usersRouter);
    app.use("/api/books", booksRouter);
    app.use("/api/orders", ordersRouter);
    app.use("/api/checkout", checkoutRouter);
    app.use("/api/payments", paymentsRouter);
    app.use("/api/favorites", favoritesRouter);
    app.use("/api/comments", commentsRouter);
    app.use("/api/dashboard", dashboardRouter);

    app.use((req: Request, res: Response) => {
      throw new BadRequestError("Route not found!");
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
